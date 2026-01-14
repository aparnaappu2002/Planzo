import { EventEntity } from "../../entities/event/eventEntity";
import { EventResponseDTO } from "./eventResponseDTO";

export const mapEventEntityToDTO = (event: EventEntity): EventResponseDTO => ({
    id: event._id?.toString() ?? "",
    title: event.title,
    description: event.description,
    location: event.location,
    hostedBy: event.hostedBy.toString(),
    startTime: event.startTime,
    endTime: event.endTime,
    posterImage: event.posterImage,
    ticketVariants: event.ticketVariants,
    date: event.date,
    address: event.address,
    venueName: event.venueName,
    category: event.category,
    status: event.status,
    attendeesCount: event.attendeesCount,
    isActive: event.isActive
});
