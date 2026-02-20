import { UpdateEventDTO } from "../../domain/dto/event/updateEventDTO";
import { EventUpdateEntity } from "../../domain/entities/event/eventUpdateEntity";

export const mapUpdateDTOToEntity = (dto: UpdateEventDTO): Partial<EventUpdateEntity> => ({
    title: dto.title,
    description: dto.description,
    location: dto.location,
    startTime: dto.startTime,
    endTime: dto.endTime,
    posterImage: dto.posterImage,
    pricePerTicket: dto.pricePerTicket,
    maxTicketsPerUser: dto.maxTicketsPerUser,
    totalTicket: dto.totalTicket,
    date: dto.date,
    address: dto.address,
    venueName: dto.venueName,
    category: dto.category,
    status: dto.status
});