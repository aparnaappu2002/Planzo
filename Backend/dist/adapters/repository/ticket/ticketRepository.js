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
exports.TicketRepository = void 0;
const mongoose_1 = require("mongoose");
const ticketModel_1 = require("../../../framework/database/models/ticketModel");
const eventModel_1 = require("../../../framework/database/models/eventModel");
const paymentModel_1 = require("../../../framework/database/models/paymentModel");
class TicketRepository {
    createTicket(ticket) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield ticketModel_1.ticketModel.create(ticket);
        });
    }
    updatePaymentstatus(ticketId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield ticketModel_1.ticketModel.findByIdAndUpdate(ticketId, { paymentStatus: 'successful' }, { new: true });
        });
    }
    findBookedTicketsOfClient(userId, pageNo) {
        return __awaiter(this, void 0, void 0, function* () {
            const page = Math.max(pageNo, 1);
            const limit = 4;
            const skip = (page - 1) * limit;
            const filter = { clientId: userId };
            const [ticketAndEvent, totalItems] = yield Promise.all([
                ticketModel_1.ticketModel.find(filter)
                    .select('_id ticketId ticketCount phone email paymentStatus totalAmount ticketStatus qrCodeLink ticketVariants paymentTransactionId')
                    .populate('eventId', '_id title description date startTime endTime status address pricePerTicket posterImage')
                    .populate('paymentTransactionId', 'paymentId status purpose') // Populate payment details
                    .skip(skip)
                    .limit(limit)
                    .sort({ createdAt: -1 })
                    .lean(),
                ticketModel_1.ticketModel.countDocuments(filter)
            ]);
            const totalPages = Math.ceil(totalItems / limit);
            const ticketAndEventDetails = ticketAndEvent.map(ticket => {
                var _a;
                const event = ticket.eventId;
                const payment = ticket.paymentTransactionId;
                return {
                    _id: (_a = ticket._id) === null || _a === void 0 ? void 0 : _a.toString(),
                    ticketId: ticket.ticketId,
                    totalAmount: ticket.totalAmount,
                    ticketCount: ticket.ticketCount,
                    phone: ticket.phone,
                    email: ticket.email,
                    paymentStatus: ticket.paymentStatus,
                    ticketStatus: ticket.ticketStatus,
                    qrCodeLink: ticket.qrCodeLink,
                    ticketVariants: ticket.ticketVariants || [],
                    paymentIntentId: (payment === null || payment === void 0 ? void 0 : payment.paymentId) || null,
                    event: {
                        _id: event._id,
                        title: event.title,
                        description: event.description,
                        date: event.date,
                        startTime: event.startTime,
                        endTime: event.endTime,
                        status: event.status,
                        address: event.address,
                        pricePerTicket: event.pricePerTicket,
                        posterImage: event.posterImage,
                    }
                };
            });
            return { ticketAndEventDetails, totalPages, totalItems };
        });
    }
    ticketCancel(ticketId, refundMethod) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            // Update ticket status and store refund method
            const ticket = yield ticketModel_1.ticketModel.findByIdAndUpdate(ticketId, {
                ticketStatus: 'refunded',
                refundMethod: refundMethod || 'wallet',
                refundedAt: new Date()
            }, { new: true })
                .populate('eventId', 'hostedBy')
                .lean();
            if (!ticket)
                return null;
            console.log('ticket in the repo', ticket);
            // Fetch payment details from payment entity
            let paymentId = null;
            if (ticket.paymentTransactionId) {
                const payment = yield paymentModel_1.paymentModel.findById(ticket.paymentTransactionId)
                    .select('paymentId status purpose')
                    .lean();
                if (payment) {
                    paymentId = payment.paymentId;
                }
            }
            const result = {
                _id: (_a = ticket._id) === null || _a === void 0 ? void 0 : _a.toString(),
                ticketId: ticket.ticketId,
                totalAmount: ticket.totalAmount,
                ticketCount: ticket.ticketCount,
                phone: ticket.phone,
                email: ticket.email,
                paymentStatus: ticket.paymentStatus,
                qrCodeLink: ticket.qrCodeLink,
                eventId: {
                    _id: ticket.eventId._id,
                    hostedBy: ticket.eventId.hostedBy,
                },
                clientId: (_b = ticket.clientId) === null || _b === void 0 ? void 0 : _b.toString(),
                ticketStatus: ticket.ticketStatus,
                paymentTransactionId: (_c = ticket.paymentTransactionId) === null || _c === void 0 ? void 0 : _c.toString(),
                paymentId: paymentId || undefined, // Payment ID from payment entity
                refundMethod: refundMethod || 'wallet',
            };
            return result;
        });
    }
    checkUserTicketLimit(clientId, eventId, ticketVariant, requestedQuantity) {
        return __awaiter(this, void 0, void 0, function* () {
            const event = yield eventModel_1.eventModal.findById(eventId).select('ticketVariants').lean();
            if (!event) {
                return {
                    canBook: false,
                    remainingLimit: 0,
                    maxPerUser: 0
                };
            }
            const variant = event.ticketVariants.find(v => v.type === ticketVariant);
            if (!variant) {
                return {
                    canBook: false,
                    remainingLimit: 0,
                    maxPerUser: 0
                };
            }
            const result = yield ticketModel_1.ticketModel.aggregate([
                {
                    $match: {
                        clientId: new mongoose_1.Types.ObjectId(clientId),
                        eventId: new mongoose_1.Types.ObjectId(eventId),
                        'ticketVariants.variant': ticketVariant,
                        ticketStatus: { $ne: 'refunded' }
                    }
                },
                {
                    $unwind: '$ticketVariants'
                },
                {
                    $match: {
                        'ticketVariants.variant': ticketVariant
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalTickets: { $sum: '$ticketVariants.count' }
                    }
                }
            ]);
            const currentTicketCount = result.length > 0 ? result[0].totalTickets : 0;
            const maxAllowed = variant.maxPerUser;
            const remainingLimit = maxAllowed - currentTicketCount;
            const canBook = currentTicketCount + requestedQuantity <= maxAllowed;
            return {
                canBook,
                remainingLimit: Math.max(0, remainingLimit),
                maxPerUser: maxAllowed
            };
        });
    }
    ticketAndUserDetails(vendorId, pageNo) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const page = Math.max(pageNo, 1);
            const limit = 6;
            const skip = (page - 1) * limit;
            const matchStage = {
                'event.hostedBy': new mongoose_1.Types.ObjectId(vendorId)
            };
            const tickets = yield ticketModel_1.ticketModel.aggregate([
                {
                    $lookup: {
                        from: 'events',
                        localField: 'eventId',
                        foreignField: '_id',
                        as: 'event'
                    }
                },
                { $unwind: '$event' },
                {
                    $match: Object.assign({}, matchStage)
                },
                {
                    $lookup: {
                        from: 'clients',
                        localField: 'clientId',
                        foreignField: '_id',
                        as: 'client'
                    }
                },
                { $unwind: '$client' },
                {
                    $addFields: {
                        eventId: '$event',
                        clientId: '$client'
                    }
                },
                { $sort: { _id: -1 } },
                {
                    $project: {
                        _id: 1,
                        ticketId: 1,
                        totalAmount: 1,
                        ticketCount: 1,
                        phone: 1,
                        email: 1,
                        paymentStatus: 1,
                        qrCodeLink: 1,
                        ticketVariant: 1,
                        ticketStatus: 1,
                        paymentTransactionId: 1,
                        eventId: {
                            _id: '$event._id',
                            title: '$event.title',
                            description: '$event.description',
                            date: '$event.date',
                            startTime: '$event.startTime',
                            endTime: '$event.endTime',
                            status: '$event.status',
                            address: '$event.address',
                            pricePerTicket: '$event.pricePerTicket',
                            posterImage: '$event.posterImage'
                        },
                        clientId: {
                            _id: '$client._id',
                            name: '$client.name',
                            profileImage: '$client.profileImage'
                        }
                    }
                },
                { $skip: skip },
                { $limit: limit }
            ]);
            const countResult = yield ticketModel_1.ticketModel.aggregate([
                {
                    $lookup: {
                        from: 'events',
                        localField: 'eventId',
                        foreignField: '_id',
                        as: 'event'
                    }
                },
                { $unwind: '$event' },
                {
                    $match: {
                        'event.hostedBy': new mongoose_1.Types.ObjectId(vendorId)
                    }
                },
                { $count: 'total' }
            ]);
            const totalCount = ((_a = countResult[0]) === null || _a === void 0 ? void 0 : _a.total) || 0;
            const totalPages = Math.ceil(totalCount / limit);
            return { ticketAndEventDetails: tickets, totalPages };
        });
    }
    findTicketUsingTicketId(ticketId) {
        return __awaiter(this, void 0, void 0, function* () {
            return ticketModel_1.ticketModel.findOne({ ticketId }).select('-__v');
        });
    }
    changeUsedStatus(ticketId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield ticketModel_1.ticketModel.findByIdAndUpdate(ticketId, { ticketStatus: 'used' });
        });
    }
    updateCheckInHistory(ticketId, date) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield ticketModel_1.ticketModel.updateOne({ _id: ticketId }, { $addToSet: { checkInHistory: date } });
            return result.modifiedCount > 0;
        });
    }
    getTicketsByStatus(ticketStatus, paymentStatus, pageNo, sortBy) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const sortOptions = {
                "newest": { createdAt: -1 },
                "oldest": { createdAt: 1 },
                "amount-low-high": { totalAmount: 1 },
                "amount-high-low": { totalAmount: -1 },
                "ticket-count": { ticketCount: -1 }
            };
            const sort = sortOptions[sortBy] || { createdAt: -1 };
            const limit = 5;
            const page = Math.max(pageNo, 1);
            const skip = (page - 1) * limit;
            const matchStage = {
                ticketStatus,
                paymentStatus
            };
            const tickets = yield ticketModel_1.ticketModel.aggregate([
                {
                    $match: matchStage
                },
                {
                    $lookup: {
                        from: 'events',
                        localField: 'eventId',
                        foreignField: '_id',
                        as: 'event'
                    }
                },
                { $unwind: '$event' },
                {
                    $lookup: {
                        from: 'clients',
                        localField: 'clientId',
                        foreignField: '_id',
                        as: 'client'
                    }
                },
                { $unwind: '$client' },
                {
                    $addFields: {
                        eventId: '$event',
                        clientId: '$client'
                    }
                },
                { $sort: sort },
                {
                    $project: {
                        _id: 1,
                        ticketId: 1,
                        totalAmount: 1,
                        ticketCount: 1,
                        phone: 1,
                        email: 1,
                        paymentStatus: 1,
                        qrCodeLink: 1,
                        ticketVariant: 1,
                        ticketStatus: 1,
                        paymentTransactionId: 1,
                        createdAt: 1,
                        eventId: {
                            _id: '$event._id',
                            title: '$event.title',
                            description: '$event.description',
                            date: '$event.date',
                            startTime: '$event.startTime',
                            endTime: '$event.endTime',
                            status: '$event.status',
                            address: '$event.address',
                            pricePerTicket: '$event.pricePerTicket',
                            posterImage: '$event.posterImage'
                        },
                        clientId: {
                            _id: '$client._id',
                            name: '$client.name',
                            profileImage: '$client.profileImage'
                        }
                    }
                },
                { $skip: skip },
                { $limit: limit }
            ]);
            const countResult = yield ticketModel_1.ticketModel.aggregate([
                {
                    $match: matchStage
                },
                { $count: 'total' }
            ]);
            const totalCount = ((_a = countResult[0]) === null || _a === void 0 ? void 0 : _a.total) || 0;
            const totalPages = Math.ceil(totalCount / limit);
            return { tickets, totalPages };
        });
    }
}
exports.TicketRepository = TicketRepository;
