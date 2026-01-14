import { EventResponseDTO } from "../../../../dto/event/eventResponseDTO";

export interface IfindEventsBasedOnCategoryUseCase {
    findEventsbasedOnCategory(category: string, pageNo: number, sortBy: string):Promise<{ events: EventResponseDTO[] | [], totalPages: number }>
}