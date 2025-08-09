import { EventEntity } from "../../../domain/entities/event/eventEntity";
import { IeventRepository } from "../../../domain/interfaces/repositoryInterfaces/event/IeventRepository";
import { IfindEventByIdUseCase } from "../../../domain/interfaces/useCaseInterfaces/client/events/IfindEventByIdUseCase";

export class FindEventByIdUseCase implements IfindEventByIdUseCase {
    private eventDatabase: IeventRepository
    constructor(eventDatabase: IeventRepository) {
        this.eventDatabase = eventDatabase
    }
    async findEventById(eventId: string): Promise<EventEntity> {
        const event = await this.eventDatabase.findEventById(eventId)
        if (!event) throw new Error("No event found in this ID")
        return event
    }
}