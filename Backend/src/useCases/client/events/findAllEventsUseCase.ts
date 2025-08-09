import { EventEntity } from "../../../domain/entities/event/eventEntity";
import { IeventRepository } from "../../../domain/interfaces/repositoryInterfaces/event/IeventRepository";
import { IfindAllEventsUseCase } from "../../../domain/interfaces/useCaseInterfaces/client/events/IfindAllEventsUseCase";

export class FindAllEventsUseCase implements IfindAllEventsUseCase {
    private eventDatabase: IeventRepository
    constructor(eventDatabase: IeventRepository) {
        this.eventDatabase = eventDatabase
    }
    async findAllEvents(pageNo: number): Promise<{ events: EventEntity[] | [], totalPages: number }> {
        const { events, totalPages } = await this.eventDatabase.findAllEventsClient(pageNo)
        if (!events) throw new Error('Error while finding all events')
        return { events, totalPages }
    }
}