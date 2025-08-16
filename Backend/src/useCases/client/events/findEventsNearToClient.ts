import { EventEntity } from "../../../domain/entities/event/eventEntity";
import { IeventRepository } from "../../../domain/interfaces/repositoryInterfaces/event/IeventRepository";
import { IfindEventsNearToClientUseCase } from "../../../domain/interfaces/useCaseInterfaces/client/events/IfindEventsNearToClient";

export class FindEventsNearToClientUseCase implements IfindEventsNearToClientUseCase {
    private eventDatabase: IeventRepository
    constructor(eventDatabase: IeventRepository) {
        this.eventDatabase = eventDatabase
    }
    async findEventsNearToClient(latitude: number, longitude: number, pageNo: number,range:number): Promise<{ events: EventEntity[] | [], totalPages: number }> {
        if (!latitude || !longitude) {
            throw new Error('Latitude or longitude is missing')
        }
        const { events, totalPages } = await this.eventDatabase.findEventsNearToClient(latitude, longitude, pageNo,range)
        return { events, totalPages }
    }
}