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
exports.CreateBookingPaymentUseCase = void 0;
class CreateBookingPaymentUseCase {
    constructor(bookingDatabase, paymentService, paymentDatabase) {
        this.bookingDatabase = bookingDatabase;
        this.paymentService = paymentService;
        this.paymentDatabase = paymentDatabase;
    }
    inititateBookingPayment(bookingId) {
        return __awaiter(this, void 0, void 0, function* () {
            const booking = yield this.bookingDatabase.findBookingByIdForPayment(bookingId);
            console.log(booking);
            if (!booking)
                throw new Error('No booking found in this ID');
            if (booking.status != 'Completed')
                throw new Error('This Booking is not completed');
            if (booking.paymentStatus == "Successfull")
                throw new Error('This booking is Already paid');
            const totalAmount = booking.date.length * booking.service.servicePrice;
            const { clientSecret, paymentIntentId } = yield this.paymentService.createPaymentIntent(totalAmount, 'service', { booking: booking });
            if (!clientSecret || !paymentIntentId) {
                throw new Error("Error while creating stripe payment intent");
            }
            const paymentDetails = {
                amount: totalAmount,
                currency: 'inr',
                paymentId: paymentIntentId,
                receiverId: booking.vendorId,
                purpose: 'serviceBooking',
                status: "pending",
                userId: booking.clientId,
                bookingId: booking._id
            };
            const createPayment = yield this.paymentDatabase.createPayment(paymentDetails);
            if (!createPayment)
                throw new Error('Error while creating payment document');
            return {
                booking,
                clientSecret,
                paymentIntentId
            };
        });
    }
}
exports.CreateBookingPaymentUseCase = CreateBookingPaymentUseCase;
