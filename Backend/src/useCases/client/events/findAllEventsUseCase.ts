import { IeventRepository } from "../../../domain/interfaces/repositoryInterfaces/event/IeventRepository";
import { IfindAllEventsUseCase } from "../../../domain/interfaces/useCaseInterfaces/client/events/IfindAllEventsUseCase";
import { EventResponseDTO } from "../../../domain/dto/event/eventResponseDTO";
import { mapEventEntityToDTO } from "../../../domain/dto/event/eventMapper";

export class FindAllEventsUseCase implements IfindAllEventsUseCase {
    private eventDatabase: IeventRepository
    constructor(eventDatabase: IeventRepository) {
        this.eventDatabase = eventDatabase
    }
    async findAllEvents(pageNo: number): Promise<{ events: EventResponseDTO[] | [], totalPages: number }> {
        const { events, totalPages } = await this.eventDatabase.findAllEventsClient(pageNo)
        if (!events) throw new Error('Error while finding all events')
        return {
        events: events.map(mapEventEntityToDTO),
        totalPages
    };

    }
}