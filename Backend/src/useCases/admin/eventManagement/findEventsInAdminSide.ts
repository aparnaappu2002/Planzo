import { EventResponseDTO } from "../../../domain/dto/event/eventResponseDTO";
import { IeventRepository } from "../../../domain/interfaces/repositoryInterfaces/event/IeventRepository";
import { IfindEventsInAdminSideUseCase } from "../../../domain/interfaces/useCaseInterfaces/admin/eventManagement/IfindEventsInAdminSide";
import { mapEventEntityToDTO } from "../../mappers/eventMapper";

export class FindEventsInAdminSideUseCase implements IfindEventsInAdminSideUseCase {
    private eventDatabase: IeventRepository
    constructor(eventDatabase: IeventRepository) {
        this.eventDatabase = eventDatabase
    }
    async findEvents(pageNo: number): Promise<{ events: EventResponseDTO[]; totalPages: number; }> {
        const {events,totalPages}= await this.eventDatabase.listingEventsInAdminSide(pageNo)
        return {
            events: events.map(mapEventEntityToDTO),
            totalPages
        };

    }
}