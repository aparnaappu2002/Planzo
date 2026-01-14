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
exports.RejectBookingInVendorUseCase = void 0;
class RejectBookingInVendorUseCase {
    constructor(bookingDatabase) {
        this.bookingDatabase = bookingDatabase;
    }
    rejectBooking(bookingId, rejectionReason) {
        return __awaiter(this, void 0, void 0, function* () {
            const rejectedBooking = yield this.bookingDatabase.rejectBooking(bookingId, rejectionReason);
            if (!rejectedBooking)
                throw new Error('There is no booking in this Booking Id');
            return true;
        });
    }
}
exports.RejectBookingInVendorUseCase = RejectBookingInVendorUseCase;
