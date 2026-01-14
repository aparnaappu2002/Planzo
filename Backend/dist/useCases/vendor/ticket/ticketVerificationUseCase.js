"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketVerificationUseCase = void 0;
class TicketVerificationUseCase {
    constructor(ticketDatabase, eventDatabase) {
        this.ticketDatabase = ticketDatabase;
        this.eventDatabase = eventDatabase;
    }
    verifyTicket(ticketId, eventId, vendorId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            const ticket = yield this.ticketDatabase.findTicketUsingTicketId(ticketId);
            if (!ticket)
                throw new Error('No ticket found in this ID');
            if (ticket.ticketStatus == 'used')
                throw new Error('This ticket is already used');
            if (ticket.ticketStatus == 'refunded')
                throw new Error('This ticket is already cancelled');
            if (ticket.eventId.toString() !== eventId)
                throw new Error('This is not the ticket of this event');
            const event = yield this.eventDatabase.findEventByIdForTicketVerification(ticket.eventId);
            if (!event)
                throw new Error('No event found in this ID');
            if (event.hostedBy.toString() !== vendorId)
                throw new Error("This event is not hosted by you");
            const today = new Date().toISOString().slice(0, 10);
            const eventDates = (_a = event.date) === null || _a === void 0 ? void 0 : _a.map(d => new Date(d).toISOString().slice(0, 10));
            if (!eventDates.includes(today)) {
                throw new Error("This ticket is not valid for today's date");
            }
            const checkInHistory = (_b = ticket.checkInHistory) === null || _b === void 0 ? void 0 : _b.map(d => new Date(d).toISOString().slice(0, 10));
            if (checkInHistory.includes(today)) {
                throw new Error('Ticket already used for today');
            }
            const updateCheckInHistory = yield this.ticketDatabase.updateCheckInHistory((_c = ticket._id) === null || _c === void 0 ? void 0 : _c.toString(), new Date(today));
            if (!updateCheckInHistory)
                throw new Error('Error while updating check in histiory for the ticket');
            const isLastDay = today === eventDates[eventDates.length - 1];
            if (isLastDay) {
                const changeStatusOfTicket = yield this.ticketDatabase.changeUsedStatus(ticket._id);
                if (!changeStatusOfTicket)
                    throw new Error('Error while changing the status of Ticket');
            }
            return ticket;
        });
    }
}
exports.TicketVerificationUseCase = TicketVerificationUseCase;
