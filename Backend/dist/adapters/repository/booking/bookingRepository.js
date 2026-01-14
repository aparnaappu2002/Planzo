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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingRepository = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const bookingModel_1 = require("../../../framework/database/models/bookingModel");
class BookingRepository {
    createBooking(booking) {
        return __awaiter(this, void 0, void 0, function* () {
            const createdBooking = yield bookingModel_1.bookingModel.create(booking);
            if (!createdBooking)
                throw new Error('error while creating a booking');
            return createdBooking;
        });
    }
    findBookingInSameDate(clientId, serviceId, dates) {
        return __awaiter(this, void 0, void 0, function* () {
            const conflictingBooking = yield bookingModel_1.bookingModel.findOne({
                clientId,
                serviceId,
                status: { $nin: ["Rejected", "Cancelled"] },
                date: { $in: dates },
            }).select('_id');
            return !!conflictingBooking;
        });
    }
    showBookingsInClient(clientId, pageNo) {
        return __awaiter(this, void 0, void 0, function* () {
            const page = Math.max(pageNo, 1);
            const limit = 5;
            const skip = (page - 1) * limit;
            const totalPages = Math.ceil((yield bookingModel_1.bookingModel.countDocuments({ clientId: new mongoose_1.default.Types.ObjectId(clientId) })) / limit);
            const bookings = yield bookingModel_1.bookingModel.find({ clientId: new mongoose_1.default.Types.ObjectId(clientId) }).populate({
                path: 'vendorId',
                select: '_id name email phone profileImage'
            }).populate({
                path: 'serviceId',
                select: '_id serviceDescription servicePrice serviceTitle serviceDuration'
            }).lean().skip(skip).limit(limit).sort({ createdAt: -1 });
            const Bookings = bookings.map((booking) => ({
                _id: booking._id,
                date: booking.date,
                paymentStatus: booking.paymentStatus,
                vendorApproval: booking.vendorApproval,
                email: booking.email,
                phone: booking.phone,
                status: booking.status,
                vendor: booking.vendorId,
                service: booking.serviceId,
                rejectionReason: booking.rejectionReason
            }));
            return { Bookings, totalPages };
        });
    }
    showBookingsInVendor(vendorId, pageNo) {
        return __awaiter(this, void 0, void 0, function* () {
            const page = Math.max(pageNo, 1);
            const limit = 5;
            const skip = (page - 1) * limit;
            const totalPages = Math.ceil((yield bookingModel_1.bookingModel.countDocuments({ vendorId: new mongoose_1.default.Types.ObjectId(vendorId) })) / limit);
            const bookings = yield bookingModel_1.bookingModel.find({ vendorId }).populate({
                path: 'clientId',
                select: '_id name email phone profileImage'
            }).populate({
                path: 'serviceId',
                select: '_id serviceDescription servicePrice serviceTitle serviceDuration'
            }).lean().skip(skip).limit(limit).sort({ createdAt: -1 });
            const Bookings = bookings.map((booking) => ({
                _id: booking._id,
                date: booking.date,
                email: booking.email,
                paymentStatus: booking.paymentStatus,
                phone: booking.phone,
                service: booking.serviceId,
                client: booking.clientId,
                status: booking.status,
                vendorApproval: booking.vendorApproval,
                rejectionReason: booking.rejectionReason
            }));
            return { Bookings, totalPages };
        });
    }
    approveBooking(bookingId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield bookingModel_1.bookingModel.findByIdAndUpdate({ _id: bookingId }, { vendorApproval: "Approved" }, { new: true });
        });
    }
    findBookingByIdForDateChecking(bookingId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield bookingModel_1.bookingModel.findById(bookingId).select('_id date vendorId');
        });
    }
    findBookingWithSameDate(bookingId, vendorId, date) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield bookingModel_1.bookingModel.findOne({
                _id: { $ne: bookingId },
                vendorId: vendorId,
                date: { $in: date },
                vendorApproval: "Approved",
            });
        });
    }
    rejectBooking(bookingId, rejectionReason) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield bookingModel_1.bookingModel.findByIdAndUpdate(bookingId, { vendorApproval: "Rejected", rejectionReason: rejectionReason });
        });
    }
    changeStatus(bookingId, status) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield bookingModel_1.bookingModel.findByIdAndUpdate(bookingId, { status: status }, { new: true });
        });
    }
    findBookingByIdForPayment(bookingId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const booking = yield bookingModel_1.bookingModel
                .findById(bookingId)
                .select("-__v -createdAt -updatedAt")
                .populate({
                path: "serviceId",
                select: "servicePrice",
                model: "service",
            })
                .lean();
            if (!booking)
                return null;
            const result = {
                _id: booking._id,
                clientId: booking.clientId,
                vendorId: booking.vendorId,
                date: booking.date,
                email: booking.email,
                phone: booking.phone,
                vendorApproval: booking.vendorApproval,
                paymentStatus: booking.paymentStatus,
                rejectionReason: booking.rejectionReason,
                status: booking.status,
                createdAt: booking.createdAt,
                isComplete: booking.isComplete,
                serviceId: (_a = booking.serviceId._id) !== null && _a !== void 0 ? _a : booking.serviceId,
                service: {
                    servicePrice: booking.serviceId.servicePrice || 0,
                },
            };
            return result;
        });
    }
    findServicePriceAndDatesOfBooking(bookingId) {
        return __awaiter(this, void 0, void 0, function* () {
            const bookingDetails = yield bookingModel_1.bookingModel.findById(bookingId).select('date').populate('serviceId', 'servicePrice').lean();
            if (!bookingDetails)
                return null;
            return { date: bookingDetails === null || bookingDetails === void 0 ? void 0 : bookingDetails.date, servicePrice: bookingDetails === null || bookingDetails === void 0 ? void 0 : bookingDetails.serviceId.servicePrice };
        });
    }
    updateBookingPaymentStatus(bookingId, status) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield bookingModel_1.bookingModel.findByIdAndUpdate(bookingId, { paymentStatus: status }, { new: true }).select('-__v -createdAt');
        });
    }
    cancelBooking(bookingId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield bookingModel_1.bookingModel.findByIdAndUpdate(bookingId, { status: 'Cancelled' }, { new: true });
        });
    }
    showAllBookingsInAdmin(pageNo) {
        return __awaiter(this, void 0, void 0, function* () {
            const page = Math.max(pageNo, 1);
            const limit = 4;
            const skip = (page - 1) * limit;
            const bookingsRaw = yield bookingModel_1.bookingModel.find().populate({
                path: 'serviceId',
                populate: {
                    path: 'categoryId',
                    select: 'name'
                },
                select: 'serviceTitle servicePrice'
            }).populate({
                path: 'clientId',
                select: 'name profileImage'
            }).populate({
                path: 'vendorId',
                select: 'name profileImage'
            }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean();
            const totalPages = Math.ceil((yield bookingModel_1.bookingModel.countDocuments()) / limit);
            const bookings = bookingsRaw.map((b) => ({
                _id: b._id,
                serviceId: {
                    _id: b.serviceId._id,
                    serviceTitle: b.serviceId.serviceTitle,
                    servicePrice: b.serviceId.servicePrice,
                    categoryId: {
                        _id: b.serviceId.categoryId._id,
                        name: b.serviceId.categoryId.name,
                    },
                },
                clientId: {
                    _id: b.clientId._id,
                    name: b.clientId.name,
                    profileImage: b.clientId.profileImage,
                },
                vendorId: {
                    _id: b.vendorId._id,
                    name: b.vendorId.name,
                    profileImage: b.vendorId.profileImage,
                },
                date: b.date,
                email: b.email,
                phone: b.phone,
                vendorApproval: b.vendorApproval,
                paymentStatus: b.paymentStatus,
                rejectionReason: b.rejectionReason,
                status: b.status,
                createdAt: b.createdAt,
                isComplete: b.isComplete,
            }));
            return { bookings, totalPages };
        });
    }
    findTotalBookings() {
        return __awaiter(this, void 0, void 0, function* () {
            return bookingModel_1.bookingModel.countDocuments({ status: 'Completed' });
        });
    }
}
exports.BookingRepository = BookingRepository;
