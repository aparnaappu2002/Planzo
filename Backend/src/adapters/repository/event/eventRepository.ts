import { EventEntity } from "../../../domain/entities/event/eventEntity";
import { EventUpdateEntity } from "../../../domain/entities/event/eventUpdateEntity";
import { IeventRepository } from "../../../domain/interfaces/repositoryInterfaces/event/IeventRepository";
import { eventModal } from "../../../framework/database/models/eventModel";
import { ObjectId } from "mongoose";
import { SearchLocationOptions } from "../../../domain/entities/event/searchLocationOptionsDTO";
import { SearchEventsResult } from "../../../domain/entities/event/searchResultDTO";

export class EventRepository implements IeventRepository{
    async createEvent(event: EventEntity): Promise<EventEntity> {
        return await eventModal.create(event)
    }
    async findEventsOfAVendor(vendorId: string, pageNo: number): Promise<{ events: EventEntity[] | []; totalPages: number; }> {
        const limit = 5
        const page = Math.max(pageNo, 1)
        const skip = (page - 1) * limit
        const events = await eventModal.find({ hostedBy: vendorId }).select('-__v').skip(skip).limit(limit)
        const totalPages = Math.ceil(await eventModal.countDocuments({ hostedBy: vendorId }) / limit)
        return { events, totalPages }
    }
    async editEvent(eventId: string, update: EventUpdateEntity): Promise<EventEntity | null> {
        return await eventModal.findByIdAndUpdate(eventId, update, { new: true }).select('-__v')
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
        return eventModal.findById(eventId).select('-__v')
    }
    async findTotalTicketAndBookedTicket(eventId: string): Promise<EventEntity | null> {
    return eventModal.findById(eventId).select('totalTicket ticketPurchased status ticketVariants')
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

}
