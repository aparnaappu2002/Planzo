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
exports.BookingClientController = void 0;
const httpStatus_1 = require("../../../../domain/enums/httpStatus");
const messages_1 = require("../../../../domain/enums/messages");
class BookingClientController {
    constructor(showServiceWithVendorUseCase, createBookingUseCase, showBookingsInClient, createBookingPaymentUseCase, confirmBookingPaymentUseCase, cancelBookingUseCase) {
        this.createBookingUseCase = createBookingUseCase;
        this.showServiceWithVendorUseCase = showServiceWithVendorUseCase;
        this.showBookingsInClient = showBookingsInClient;
        this.createBookingPaymentUseCase = createBookingPaymentUseCase;
        this.confirmBookingPaymentUseCase = confirmBookingPaymentUseCase;
        this.cancelBookingUseCase = cancelBookingUseCase;
    }
    handleShowServiceWithVendor(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { serviceId, pageNo, rating } = req.query;
                if (!serviceId || !pageNo) {
                    res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({ error: messages_1.Messages.SERVICE_ID_REQUIRED });
                    return;
                }
                const page = parseInt(pageNo === null || pageNo === void 0 ? void 0 : pageNo.toString(), 10) || 1;
                const { reviews, service, totalPages } = yield this.showServiceWithVendorUseCase.showServiceWithVendorUseCase(serviceId.toString(), page);
                res.status(httpStatus_1.HttpStatus.OK).json({ message: messages_1.Messages.SERVICE_FETCHED, serviceWithVendor: service, reviews, totalPages });
            }
            catch (error) {
                console.log('error while fetching the service data with venodor', error);
                res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({
                    message: messages_1.Messages.SERVICE_FETCH_ERROR,
                    error: error instanceof Error ? error.message : messages_1.Messages.SERVICE_FETCH_ERROR
                });
            }
        });
    }
    handleCreateBooking(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const booking = req.body.booking;
                const createdBooking = yield this.createBookingUseCase.createBooking(booking);
                console.log(createdBooking);
                if (!createdBooking)
                    res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({ message: messages_1.Messages.BOOKING_CREATE_ERROR });
                res.status(httpStatus_1.HttpStatus.OK).json({ message: messages_1.Messages.BOOKING_CREATED, createdBooking });
            }
            catch (error) {
                console.log('error while creating booking', error);
                res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({
                    message: messages_1.Messages.BOOKING_CREATE_ERROR,
                    error: error instanceof Error ? error.message : messages_1.Messages.BOOKING_CREATE_ERROR
                });
            }
        });
    }
    handleShowBookingsInClient(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { clientId, pageNo } = req.params;
                const page = parseInt(pageNo, 10) || 1;
                const { Bookings, totalPages } = yield this.showBookingsInClient.findBookings(clientId, page);
                res.status(httpStatus_1.HttpStatus.OK).json({ message: messages_1.Messages.BOOKING_FETCHED, Bookings, totalPages });
            }
            catch (error) {
                console.log('error while fetching bookings in client', error);
                res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({
                    message: messages_1.Messages.BOOKING_FETCH_ERROR,
                    error: error instanceof Error ? error.message : messages_1.Messages.BOOKING_FETCH_ERROR
                });
            }
        });
    }
    handleCreateBookingPayment(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { bookingId } = req.body;
                const { clientSecret, paymentIntentId, booking } = yield this.createBookingPaymentUseCase.inititateBookingPayment(bookingId);
                res.status(httpStatus_1.HttpStatus.OK).json({ message: messages_1.Messages.PAYMENT_INITIATED, clientSecret,
                    paymentIntentId,
                    booking, });
            }
            catch (error) {
                console.log('error while initiating booking payment', error);
                res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({
                    message: messages_1.Messages.PAYMENT_INITIATE_ERROR,
                    error: error instanceof Error ? error.message : messages_1.Messages.PAYMENT_INITIATE_ERROR
                });
            }
        });
    }
    handleConfirmBookingPaymentUseCase(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { booking, paymentIntentId } = req.body;
                const ConfirmBooking = yield this.confirmBookingPaymentUseCase.confirmBookingPayment(booking, paymentIntentId);
                res.status(httpStatus_1.HttpStatus.OK).json({ message: messages_1.Messages.PAYMENT_CONFIRMED });
            }
            catch (error) {
                console.log('error while confirming booking payment', error);
                res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({
                    message: messages_1.Messages.PAYMENT_CONFIRM_ERROR,
                    error: error instanceof Error ? error.message : messages_1.Messages.PAYMENT_CONFIRM_ERROR
                });
            }
        });
    }
    handleCancelBooking(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { bookingId } = req.body;
                const cancelBooking = yield this.cancelBookingUseCase.cancelBooking(bookingId);
                res.status(httpStatus_1.HttpStatus.OK).json({ message: messages_1.Messages.BOOKING_CANCELLED, cancelBooking });
            }
            catch (error) {
                console.log('error while canceling the booking', error);
                res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({
                    message: messages_1.Messages.BOOKING_CANCEL_ERROR,
                    error: error instanceof Error ? error.message : messages_1.Messages.BOOKING_CANCEL_ERROR
                });
            }
        });
    }
}
exports.BookingClientController = BookingClientController;
