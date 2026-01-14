import { IeventRepository } from "../../../domain/interfaces/repositoryInterfaces/event/IeventRepository";
import { IfindEventsNearToClientUseCase } from "../../../domain/interfaces/useCaseInterfaces/client/events/IfindEventsNearToClient";
import { EventResponseDTO } from "../../../domain/dto/event/eventResponseDTO";
import { mapEventEntityToDTO } from "../../../domain/dto/event/eventMapper";

export class FindEventsNearToClientUseCase implements IfindEventsNearToClientUseCase {
    private eventDatabase: IeventRepository
    constructor(eventDatabase: IeventRepository) {
        this.eventDatabase = eventDatabase
    }
    async findEventsNearToClient(latitude: number, longitude: number, pageNo: number,range:number): Promise<{ events: EventResponseDTO[] | [], totalPages: number }> {
        if (!latitude || !longitude) {
            throw new Error('Latitude or longitude is missing')
        }
        const { events, totalPages } = await this.eventDatabase.findEventsNearToClient(latitude, longitude, pageNo,range)
        return {
        events: events.map(mapEventEntityToDTO),
        totalPages
    };

    }
}