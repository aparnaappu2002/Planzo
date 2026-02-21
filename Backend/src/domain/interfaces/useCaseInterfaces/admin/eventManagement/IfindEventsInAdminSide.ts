import { EventResponseDTO } from "../../../../dto/event/eventResponseDTO";

export interface IfindEventsInAdminSideUseCase {
    findEvents(pageNo: number): Promise<{ events: EventResponseDTO[], totalPages: number }>
}