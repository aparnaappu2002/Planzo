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
exports.ApproveBookingUseCase = void 0;
class ApproveBookingUseCase {
    constructor(bookingDatabase) {
        this.bookingDatabase = bookingDatabase;
    }
    approveBooking(bookingId) {
        return __awaiter(this, void 0, void 0, function* () {
            const booking = yield this.bookingDatabase.findBookingByIdForDateChecking(bookingId);
            if (!booking)
                throw new Error("No booking Found in this Id");
            const conflict = yield this.bookingDatabase.findBookingWithSameDate(bookingId, booking.vendorId.toString(), booking.date);
            if (conflict)
                throw new Error("Booking conflict: another booking already exists on this date");
            const approvedBooking = yield this.bookingDatabase.approveBooking(bookingId);
            if (!approvedBooking) {
                throw new Error('There is no Booking with this ID');
            }
            return true;
        });
    }
}
exports.ApproveBookingUseCase = ApproveBookingUseCase;
