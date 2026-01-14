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
exports.BookingsVendorController = void 0;
const httpStatus_1 = require("../../../../domain/enums/httpStatus");
class BookingsVendorController {
    constructor(showBookingsInVendorUseCase, approveBookingVendorUseCase, rejectBookingVendorUseCase, updateBookingAsCompleteUseCase) {
        this.showBookingsInVendorUseCase = showBookingsInVendorUseCase;
        this.approveBookingVendorUseCase = approveBookingVendorUseCase;
        this.rejectBookingVendorUseCase = rejectBookingVendorUseCase;
        this.updateBookingAsCompleteUseCase = updateBookingAsCompleteUseCase;
    }
    handleShowBookingsInVendor(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { vendorId, pageNo } = req.params;
                const page = parseInt(pageNo, 10) || 1;
                const { Bookings, totalPages } = yield this.showBookingsInVendorUseCase.showBookingsInVendor(vendorId, page);
                res.status(httpStatus_1.HttpStatus.OK).json({ message: "Bookings fetched", Bookings, totalPages });
            }
            catch (error) {
                console.log('error while fetching bookigns for vendorSide', error);
                res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({
                    message: 'error while fetching bookigns for vendorSide',
                    error: error instanceof Error ? error.message : 'error while fetching bookigns for vendorSide'
                });
            }
        });
    }
    handleApproveBooking(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { bookingId } = req.body;
                const changeStatus = yield this.approveBookingVendorUseCase.approveBooking(bookingId);
                if (changeStatus)
                    res.status(httpStatus_1.HttpStatus.OK).json({ message: "Vendor Approved" });
            }
            catch (error) {
                console.log('error while changing the status of the booking', error);
                res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({
                    message: 'error while changing the status of the booking',
                    error: error instanceof Error ? error.message : 'error while changing the status of the booking'
                });
            }
        });
    }
    handleRejectBookingInVendor(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { bookingId, rejectionReason } = req.body;
                const rejectedBooking = yield this.rejectBookingVendorUseCase.rejectBooking(bookingId, rejectionReason);
                if (rejectedBooking) {
                    res.status(httpStatus_1.HttpStatus.OK).json({ message: 'Rejected booking' });
                }
            }
            catch (error) {
                console.log('error while rejecting booking', error);
                res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({
                    message: 'error while rejectig booking',
                    error: error instanceof Error ? error.message : 'error while rejecting booking'
                });
            }
        });
    }
    handleUpdateBookingComplete(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { bookingId, status } = req.body;
                const updateBooking = yield this.updateBookingAsCompleteUseCase.changeStatusOfBooking(bookingId, status);
                res.status(httpStatus_1.HttpStatus.OK).json({ message: "Booking marked as completed" });
            }
            catch (error) {
                console.log('error while updating complete status of booking', error);
                res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({
                    message: 'error while updating complete status of booking',
                    error: error instanceof Error ? error.message : 'error while updating complete status of booking'
                });
            }
        });
    }
}
exports.BookingsVendorController = BookingsVendorController;
