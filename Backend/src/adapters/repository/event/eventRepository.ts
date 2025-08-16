import { EventEntity } from "../../../domain/entities/event/eventEntity";
import { EventUpdateEntity } from "../../../domain/entities/event/eventUpdateEntity";
import { IeventRepository } from "../../../domain/interfaces/repositoryInterfaces/event/IeventRepository";
import { eventModal } from "../../../framework/database/models/eventModel";
import { ObjectId } from "mongoose";

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
        return eventModal.findById(eventId).select('totalTicket ticketPurchased status')
    }
    async findTotalTicketCountAndticketPurchased(eventId: string | ObjectId): Promise<{ totalTicket: number; ticketPurchased: number; }> {
        const eventDetails = await eventModal.findById(eventId).select('ticketPurchased totalTicket')
        if (!eventDetails) throw new Error('No event found in this ID')
        return { totalTicket: eventDetails?.totalTicket, ticketPurchased: eventDetails?.ticketPurchased }
    }
    async updateTicketPurchaseCount(eventId: string | ObjectId, newCount: number): Promise<EventEntity | null> {
        return eventModal.findByIdAndUpdate(eventId, { ticketPurchased: newCount })
    }
    async findEventsBasedOnQuery(query: string): Promise<EventEntity[] | []> {
        const regex = new RegExp(query || '', 'i');
        return await eventModal.find({ title: { $regex: regex }, isActive: true }).select('_id title posterImage')
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
}
