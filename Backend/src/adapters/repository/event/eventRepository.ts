import { EventEntity } from "../../../domain/entities/event/eventEntity";
import { EventUpdateEntity } from "../../../domain/entities/event/eventUpdateEntity";
import { IeventRepository } from "../../../domain/interfaces/repositoryInterfaces/event/IeventRepository";
import { eventModal } from "../../../framework/database/models/eventModel";
import { ObjectId,Types } from "mongoose";
import { SearchLocationOptions } from "../../../domain/dto/searchLocationOptionsDTO";
import { SearchEventsResult } from "../../../domain/dto/searchResultDTO";
import { EventDashboardDTO } from "../../../domain/dto/eventDashboardDTO";

export class EventRepository implements IeventRepository{
    async createEvent(event: EventEntity): Promise<EventEntity> {
        return await eventModal.create(event)
    }
    async findEventsOfAVendor(vendorId: string, pageNo: number): Promise<{ events: EventEntity[] | []; totalPages: number; }> {
        const limit = 6
        const page = Math.max(pageNo, 1)
        const skip = (page - 1) * limit
        const events = await eventModal.find({ hostedBy: vendorId }).select('-__v').sort({ createdAt: -1 }).skip(skip).limit(limit)
        const totalPages = Math.ceil(await eventModal.countDocuments({ hostedBy: vendorId }) / limit)
        return { events, totalPages }
    }
    async editEvent(eventId: string, update: EventUpdateEntity): Promise<EventEntity | null> {
        return await eventModal.findByIdAndUpdate(eventId, update, { new: true }).select('-__v').lean() as EventEntity | null;
    }
    async findAllEventsClient(pageNo: number): Promise<{ events: EventEntity[] | [], totalPages: number }> {
        const limit = 8
        const page = Math.max(pageNo, 1)
        const skip = (page - 1) * limit
        const events = await eventModal.find({ isActive: true }).select('-__v').skip(skip).limit(limit).sort({ createdAt: -1 })
        const totalPages = Math.ceil(await eventModal.countDocuments() / limit)
        return { events, totalPages }
    }
    async findEventById(eventId: string): Promise<EventEntity | null> {
        return await eventModal.findById(eventId).select('-__v').lean() as EventEntity | null;
    }
    async findTotalTicketAndBookedTicket(eventId: string): Promise<EventEntity | null> {
    return await eventModal.findById(eventId).select('totalTicket ticketPurchased status ticketVariants').lean() as EventEntity | null;
    }

    async findTotalTicketCountAndticketPurchased(eventId: string | ObjectId): Promise<{ totalTicket: number; ticketPurchased: number; }> {
    const eventDetails = await eventModal.findById(eventId).select('ticketVariants');
    if (!eventDetails) throw new Error('No event found in this ID');
    
    const totalTicket = eventDetails.ticketVariants.reduce((sum, variant) => sum + variant.totalTickets, 0);
    const ticketPurchased = eventDetails.ticketVariants.reduce((sum, variant) => sum + variant.ticketsSold, 0);
    
    return { totalTicket, ticketPurchased };
    }

    async updateTicketPurchaseCount(eventId: string | ObjectId, newCount: number): Promise<EventEntity | null> {
        return eventModal.findByIdAndUpdate(eventId, { ticketPurchased: newCount })
    }
    async findEventsBasedOnQuery(query: string): Promise<EventEntity[] | []> {
    const regex = new RegExp(query || '', 'i');
    
    return await eventModal.find({ 
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
    }).select('_id title posterImage address venueName location ')
    }

    async findEventsNearToClient(latitude: number, longitude: number, pageNo: number, range: number): Promise<{ events: EventEntity[] | [], totalPages: number }> {
        const page = Math.max(pageNo, 1)
        const limit = 5
        const skip = (page - 1) * limit


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

        const events = await eventModal.find({ ...locationQuery, isActive: true }).skip(skip).limit(limit).sort({ createdAt: -1 })
        const totalPages = Math.ceil(await eventModal.countDocuments({ locationQuery, isActive: true }) / limit)
        return { events, totalPages }
    }
    async findEventsBaseOnCategory(category: string, pageNo: number, sortBy: string): Promise<{ events: EventEntity[] | []; totalPages: number; }> {
        const sortOptions: Record<string, any> = {
            "a-z": { title: 1 },
            "z-a": { title: -1 },
            "price-low-high": { pricePerTicket: 1 },
            "price-high-low": { pricePerTicket: -1 },
            "newest": { createdAt: -1 },
            "oldest": { createdAt: 1 }
        }
        const sort = sortOptions[sortBy] || { createdAt: -1 }
        const limit = 5
        const page = Math.max(pageNo, 1)
        const skip = (page - 1) * limit
        const categoryQuery = { category: { $regex: new RegExp(category, 'i') } }
        const events = await eventModal.find(categoryQuery).select('-__v').skip(skip).limit(limit).sort(sort)
        const totalPages = Math.ceil(await eventModal.countDocuments(categoryQuery) / limit)
        return { events, totalPages }

    }
    async findEventsNearLocation(
        locationQuery: string, 
        options: SearchLocationOptions
    ): Promise<SearchEventsResult> {
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
        
        const events = await eventModal.find(query)
            .select('_id title posterImage address venueName location category pricePerTicket date startTime endTime')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        
        const totalCount = await eventModal.countDocuments(query);
        const totalPages = Math.ceil(totalCount / limit);
        
        return { events, totalPages, totalCount };
    }
    async updateVariantTicketsSold(eventId: string | ObjectId, variantType: string, ticketCount: number): Promise<EventEntity | null> {
    return eventModal.findOneAndUpdate(
        { 
            _id: eventId,
            "ticketVariants.type": variantType 
        },
        { 
            $inc: { 
                "ticketVariants.$.ticketsSold": ticketCount,
                "attendeesCount": ticketCount
            }
        },
        { new: true }
    );
}
async listingEventsInAdminSide(pageNo: number): Promise<{ events: EventEntity[] | [], totalPages: number }> {
        const limit = 3
        const page = Math.max(pageNo, 1)
        const skip = (page - 1) * limit
        const events = await eventModal.find().select('-__v').skip(skip).limit(limit).lean()
        const totalPages = Math.ceil(await eventModal.countDocuments() / limit)
        return { events, totalPages }
    }
    async findEventByIdForTicketVerification(eventId: string): Promise<EventEntity | null> {
        return await eventModal.findById(eventId).select('hostedBy date').lean() as EventEntity | null;
    }
    async eventDetailsForAdminDashboard(): Promise<EventDashboardDTO> {
        const totalEvents = await eventModal.countDocuments()
        const activeEvents = await eventModal.countDocuments({ isActive: true })
        const inactiveEvents = await eventModal.countDocuments({ isActive: false })

        const statusAgg = await eventModal.aggregate([
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 }
                }
            }
        ])

        const statusCount = statusAgg.reduce((acc, item) => {
            acc[item._id] = item.count
            return acc
        }, {
            upcoming: 0,
            completed: 0,
            cancelled: 0
        })

        const totalTicketsAgg = await eventModal.aggregate([
            {
                $group: {
                    _id: null,
                    total: { $sum: "$ticketPurchased" }
                }
            }
        ])

        const totalTicketsSold = totalTicketsAgg[0]?.total || 0

        return {
            totalEvents,
            activeEvents,
            inactiveEvents,
            statusCount,
            totalTicketsSold
        }
    }
    async findTotalEvents(vendorId: string, datePeriod: Date | null): Promise<number> {
        const query: Record<string, any> = { hostedBy: vendorId }
        if (datePeriod) {
            query.createdAt = { $gte: datePeriod }
        }
        return eventModal.countDocuments(query)
    }
    async findRecentEvents(vendorId: string): Promise<EventEntity[] | []> {
        return await eventModal.find({ hostedBy: vendorId })
    }
    async findTotalticketsSold(vendorId: string, datePeriod: Date | null): Promise<number> {
        const query: Record<string, any> = { hostedBy: new Types.ObjectId(vendorId) }
        if (datePeriod) {
            query.createdAt = { $gte: datePeriod }
        }
        const result = await eventModal.aggregate([
            { $match: query },
            {
                $group: {
                    _id: null,
                    totalTickets: { $sum: "$ticketPurchased" }
                }
            }
        ])
        return result[0]?.totalTickets || 0

    }
    async findAllEventsOfAVendor(vendorId: string): Promise<EventEntity[] | []> {
        return await eventModal.find({ hostedBy: vendorId })
    }
    async searchEventsByName(
        vendorId: string,
        searchQuery: string,
        pageNo: number
    ): Promise<{
        events: EventEntity[] | [];
        totalPages: number;
        totalResults: number;
    }> {
        const limit = 10;
        const skip = (pageNo - 1) * limit;
        
        const query: any = {
            hostedBy: vendorId,
            title: { $regex: searchQuery, $options: 'i' } 
        };
    
        const totalResults = await eventModal.countDocuments(query);
        const totalPages = Math.ceil(totalResults / limit);
    
        const events = await eventModal.find(query)
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 })
            .lean();
    
        return { events, totalPages, totalResults };
    }
    
}
