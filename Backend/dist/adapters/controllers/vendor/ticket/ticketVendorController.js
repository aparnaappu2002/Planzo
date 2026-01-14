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
exports.TicketVendorController = void 0;
const httpStatus_1 = require("../../../../domain/enums/httpStatus");
class TicketVendorController {
    constructor(ticketAndUserDetailsUseCase, ticketVerificationUseCase) {
        this.ticketAndUserDetailsUseCase = ticketAndUserDetailsUseCase;
        this.ticketVerificationUseCase = ticketVerificationUseCase;
    }
    handleTicketAndUserDetails(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { vendorId, pageNo } = req.query;
                const page = parseInt(pageNo, 10) || 1;
                if (!vendorId) {
                    res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({ message: 'vendor id is missing' });
                    return;
                }
                const { ticketAndEventDetails, totalPages } = yield this.ticketAndUserDetailsUseCase.findTicketAndUserDetailsOfEvent(vendorId === null || vendorId === void 0 ? void 0 : vendorId.toString(), page);
                res.status(httpStatus_1.HttpStatus.OK).json({ message: "Ticket and user details", ticketAndEventDetails, totalPages });
            }
            catch (error) {
                console.log('error while fetching the ticket and user details of the event', error);
                res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({
                    message: 'error while fetching the ticket and user details of the event',
                    error: error instanceof Error ? error.message : 'error while fetching the ticket and user details of the event'
                });
            }
        });
    }
    handleTicketConfirmation(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { ticketId, eventId } = req.body;
                const vendorId = req.user.userId;
                console.log('This is event id in controller', eventId);
                const verifiedTicket = yield this.ticketVerificationUseCase.verifyTicket(ticketId, eventId, vendorId);
                res.status(httpStatus_1.HttpStatus.OK).json({ message: "Ticket verified", verifiedTicket });
            }
            catch (error) {
                console.log('error while ticket confirming', error);
                res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({
                    message: "error while ticket confirming",
                    error: error instanceof Error ? error.message : 'error while ticket confirming'
                });
            }
        });
    }
}
exports.TicketVendorController = TicketVendorController;
