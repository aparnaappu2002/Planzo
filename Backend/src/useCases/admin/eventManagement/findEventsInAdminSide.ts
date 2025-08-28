import { EventEntity } from "../../../domain/entities/event/eventEntity";
import { IeventRepository } from "../../../domain/interfaces/repositoryInterfaces/event/IeventRepository";
import { IfindEventsInAdminSideUseCase } from "../../../domain/interfaces/useCaseInterfaces/admin/eventManagement/IfindEventsInAdminSide";

export class FindEventsInAdminSideUseCase implements IfindEventsInAdminSideUseCase {
    private eventDatabase: IeventRepository
    constructor(eventDatabase: IeventRepository) {
        this.eventDatabase = eventDatabase
    }
    async findEvents(pageNo: number): Promise<{ events: EventEntity[] | []; totalPages: number; }> {
        return await this.eventDatabase.listingEventsInAdminSide(pageNo)
    }
}