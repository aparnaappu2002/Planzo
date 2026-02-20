import { EventEntity } from "../../domain/entities/event/eventEntity";
import { FindEventVendorDTO } from "../../domain/dto/event/findEventVendorDTO";

export const mapEventEntityVendorToDTO = (event: EventEntity): FindEventVendorDTO => ({
    _id: event._id?.toString(),
    title: event.title,
    description: event.description,
    location: event.location,
    hostedBy: event.hostedBy.toString(),
    startTime: event.startTime,
    endTime: event.endTime,
    posterImage: event.posterImage,
    ticketVariants: event.ticketVariants,
    date: event.date,
    createdAt: event.createdAt,
    attendees: event.attendees.map(a => a.toString()),
    address: event.address,
    venueName: event.venueName,
    category: event.category,
    status: event.status,
    attendeesCount: event.attendeesCount,
    isActive: event.isActive
});