import { EventEntity } from "../../../domain/entities/event/eventEntity";
import { IeventRepository } from "../../../domain/interfaces/repositoryInterfaces/event/IeventRepository";
import { IfindEventsBasedOnCategoryUseCase } from "../../../domain/interfaces/useCaseInterfaces/client/events/IfindEventsBasedOnCategory";
import { EventResponseDTO } from "../../../domain/dto/event/eventResponseDTO";
import { mapEventEntityToDTO } from "../../../domain/dto/event/eventMapper";

export class FindEventsBasedOnCategoryUseCase implements IfindEventsBasedOnCategoryUseCase {
    private eventDatabase: IeventRepository
    constructor(eventDatabase: IeventRepository) {
        this.eventDatabase = eventDatabase
    }
    async findEventsbasedOnCategory(category: string, pageNo: number, sortBy: string): Promise<{ events: EventResponseDTO[] | [], totalPages: number }> {
        const { events, totalPages } = await this.eventDatabase.findEventsBaseOnCategory(category, pageNo, sortBy)
        return {
        events: events.map(mapEventEntityToDTO),
        totalPages
    };

    }
}