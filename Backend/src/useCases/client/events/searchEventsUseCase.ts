import { EventEntity } from "../../../domain/entities/event/eventEntity";
import { IeventRepository } from "../../../domain/interfaces/repositoryInterfaces/event/IeventRepository";
import { IsearchEventsUseCase } from "../../../domain/interfaces/useCaseInterfaces/client/events/IsearchEventsUseCase";

export class searchEventsUseCase implements IsearchEventsUseCase {
    private eventDatabase: IeventRepository
    constructor(eventDatabase: IeventRepository) {
        this.eventDatabase = eventDatabase
    }
    async searchEvents(query: string): Promise<EventEntity[] | []> {
        if (!query) throw new Error('No query available')
        return await this.eventDatabase.findEventsBasedOnQuery(query)
    }
}