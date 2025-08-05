import { EventEntity } from "../../../domain/entities/event/eventEntity";
import { IeventRepository } from "../../../domain/interfaces/repositoryInterfaces/event/IeventRepository";
import { IeventCreationUseCase } from "../../../domain/interfaces/useCaseInterfaces/vendor/event/IeventCreationUseCase";

export class EventCreationUseCase implements IeventCreationUseCase {
    private eventDatabase: IeventRepository
    constructor(eventDatabase: IeventRepository) {
        this.eventDatabase = eventDatabase
    }
    async createEvent(event: EventEntity, vendorId: string): Promise<EventEntity> {
        event.hostedBy = vendorId
        const createEvent = await this.eventDatabase.createEvent(event)
        if (!createEvent) throw new Error('Error while creating event')
        return createEvent
    }
}