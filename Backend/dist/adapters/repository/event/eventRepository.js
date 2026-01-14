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
exports.EventRepository = void 0;
const eventModel_1 = require("../../../framework/database/models/eventModel");
class EventRepository {
    createEvent(event) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield eventModel_1.eventModal.create(event);
        });
    }
    findEventsOfAVendor(vendorId, pageNo) {
        return __awaiter(this, void 0, void 0, function* () {
            const limit = 5;
            const page = Math.max(pageNo, 1);
            const skip = (page - 1) * limit;
            const events = yield eventModel_1.eventModal.find({ hostedBy: vendorId }).select('-__v').skip(skip).limit(limit);
            const totalPages = Math.ceil((yield eventModel_1.eventModal.countDocuments({ hostedBy: vendorId })) / limit);
            return { events, totalPages };
        });
    }
    editEvent(eventId, update) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield eventModel_1.eventModal.findByIdAndUpdate(eventId, update, { new: true }).select('-__v');
        });
    }
    findAllEventsClient(pageNo) {
        return __awaiter(this, void 0, void 0, function* () {
            const limit = 8;
            const page = Math.max(pageNo, 1);
            const skip = (page - 1) * limit;
            const events = yield eventModel_1.eventModal.find({ isActive: true }).select('-__v').skip(skip).limit(limit).sort({ createdAt: -1 });
            const totalPages = Math.ceil((yield eventModel_1.eventModal.countDocuments()) / limit);
            return { events, totalPages };
        });
    }
    findEventById(eventId) {
        return __awaiter(this, void 0, void 0, function* () {
            return eventModel_1.eventModal.findById(eventId).select('-__v');
        });
    }
    findTotalTicketAndBookedTicket(eventId) {
        return __awaiter(this, void 0, void 0, function* () {
            return eventModel_1.eventModal.findById(eventId).select('totalTicket ticketPurchased status ticketVariants');
        });
    }
    findTotalTicketCountAndticketPurchased(eventId) {
        return __awaiter(this, void 0, void 0, function* () {
            const eventDetails = yield eventModel_1.eventModal.findById(eventId).select('ticketVariants');
            if (!eventDetails)
                throw new Error('No event found in this ID');
            const totalTicket = eventDetails.ticketVariants.reduce((sum, variant) => sum + variant.totalTickets, 0);
            const ticketPurchased = eventDetails.ticketVariants.reduce((sum, variant) => sum + variant.ticketsSold, 0);
            return { totalTicket, ticketPurchased };
        });
    }
    updateTicketPurchaseCount(eventId, newCount) {
        return __awaiter(this, void 0, void 0, function* () {
            return eventModel_1.eventModal.findByIdAndUpdate(eventId, { ticketPurchased: newCount });
        });
    }
    findEventsBasedOnQuery(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const regex = new RegExp(query || '', 'i');
            return yield eventModel_1.eventModal.find({
                $and: [
                    { isActive: true },
                    {
                        $or: [
                            { title: { $regex: regex } },
                            { address: { $regex: regex } },
                            { venueName: { $regex: regex } },
                        ]
                    }
                ]
            }).select('_id title posterImage address venueName location ');
        });
    }
    findEventsNearToClient(latitude, longitude, pageNo, range) {
        return __awaiter(this, void 0, void 0, function* () {
            const page = Math.max(pageNo, 1);
            const limit = 5;
            const skip = (page - 1) * limit;
            const locationQuery = {
                location: {
                    $near: {
                        $geometry: {
                            type: 'Point',
                            coordinates: [longitude, latitude],
                        },
                        $maxDistance: range,
                    },
                },
            };
            const events = yield eventModel_1.eventModal.find(Object.assign(Object.assign({}, locationQuery), { isActive: true })).skip(skip).limit(limit).sort({ createdAt: -1 });
            const totalPages = Math.ceil((yield eventModel_1.eventModal.countDocuments({ locationQuery, isActive: true })) / limit);
            return { events, totalPages };
        });
    }
    findEventsBaseOnCategory(category, pageNo, sortBy) {
        return __awaiter(this, void 0, void 0, function* () {
            const sortOptions = {
                "a-z": { title: 1 },
                "z-a": { title: -1 },
                "price-low-high": { pricePerTicket: 1 },
                "price-high-low": { pricePerTicket: -1 },
                "newest": { createdAt: -1 },
                "oldest": { createdAt: 1 }
            };
            const sort = sortOptions[sortBy] || { createdAt: -1 };
            const limit = 5;
            const page = Math.max(pageNo, 1);
            const skip = (page - 1) * limit;
            const categoryQuery = { category: { $regex: new RegExp(category, 'i') } };
            const events = yield eventModel_1.eventModal.find(categoryQuery).select('-__v').skip(skip).limit(limit).sort(sort);
            const totalPages = Math.ceil((yield eventModel_1.eventModal.countDocuments(categoryQuery)) / limit);
            return { events, totalPages };
        });
    }
    findEventsNearLocation(locationQuery, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const { pageNo = 1, limit = 10, range = 25 } = options;
            const skip = (pageNo - 1) * limit;
            const locationRegex = new RegExp(locationQuery.replace(/\s+/g, '\\s*'), 'i');
            const query = {
                $and: [
                    { isActive: true },
                    {
                        $or: [
                            { address: { $regex: locationRegex } },
                            { venueName: { $regex: locationRegex } },
                            { title: { $regex: locationRegex } }
                        ]
                    }
                ]
            };
            const events = yield eventModel_1.eventModal.find(query)
                .select('_id title posterImage address venueName location category pricePerTicket date startTime endTime')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit);
            const totalCount = yield eventModel_1.eventModal.countDocuments(query);
            const totalPages = Math.ceil(totalCount / limit);
            return { events, totalPages, totalCount };
        });
    }
    updateVariantTicketsSold(eventId, variantType, ticketCount) {
        return __awaiter(this, void 0, void 0, function* () {
            return eventModel_1.eventModal.findOneAndUpdate({
                _id: eventId,
                "ticketVariants.type": variantType
            }, {
                $inc: {
                    "ticketVariants.$.ticketsSold": ticketCount,
                    "attendeesCount": ticketCount
                }
            }, { new: true });
        });
    }
    listingEventsInAdminSide(pageNo) {
        return __awaiter(this, void 0, void 0, function* () {
            const limit = 3;
            const page = Math.max(pageNo, 1);
            const skip = (page - 1) * limit;
            const events = yield eventModel_1.eventModal.find().select('-__v').skip(skip).limit(limit).lean();
            const totalPages = Math.ceil((yield eventModel_1.eventModal.countDocuments()) / limit);
            return { events, totalPages };
        });
    }
    findEventByIdForTicketVerification(eventId) {
        return __awaiter(this, void 0, void 0, function* () {
            return eventModel_1.eventModal.findById(eventId).select('hostedBy date');
        });
    }
    eventDetailsForAdminDashboard() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const totalEvents = yield eventModel_1.eventModal.countDocuments();
            const activeEvents = yield eventModel_1.eventModal.countDocuments({ isActive: true });
            const inactiveEvents = yield eventModel_1.eventModal.countDocuments({ isActive: false });
            const statusAgg = yield eventModel_1.eventModal.aggregate([
                {
                    $group: {
                        _id: "$status",
                        count: { $sum: 1 }
                    }
                }
            ]);
            const statusCount = statusAgg.reduce((acc, item) => {
                acc[item._id] = item.count;
                return acc;
            }, {
                upcoming: 0,
                completed: 0,
                cancelled: 0
            });
            const totalTicketsAgg = yield eventModel_1.eventModal.aggregate([
                {
                    $group: {
                        _id: null,
                        total: { $sum: "$ticketPurchased" }
                    }
                }
            ]);
            const totalTicketsSold = ((_a = totalTicketsAgg[0]) === null || _a === void 0 ? void 0 : _a.total) || 0;
            return {
                totalEvents,
                activeEvents,
                inactiveEvents,
                statusCount,
                totalTicketsSold
            };
        });
    }
}
exports.EventRepository = EventRepository;
