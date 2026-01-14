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
exports.CreateBookingUseCase = void 0;
class CreateBookingUseCase {
    constructor(bookingDatabase) {
        this.bookingDatabase = bookingDatabase;
    }
    createBooking(booking) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingBooking = yield this.bookingDatabase.findBookingInSameDate(booking.clientId.toString(), booking.serviceId.toString(), booking.date);
            if (existingBooking)
                throw new Error('There is already a booking in same date');
            return yield this.bookingDatabase.createBooking(booking);
        });
    }
}
exports.CreateBookingUseCase = CreateBookingUseCase;
