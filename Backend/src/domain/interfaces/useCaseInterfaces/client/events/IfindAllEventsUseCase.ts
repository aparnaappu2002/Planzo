import { EventResponseDTO } from "../../../../dto/event/eventResponseDTO";

export interface IfindAllEventsUseCase {
    findAllEvents(pageNo: number): Promise<{ events: EventResponseDTO[] | [], totalPages: number }>
}