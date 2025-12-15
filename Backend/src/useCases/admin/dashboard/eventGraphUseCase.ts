import { EventDashboardDTO } from "../../../domain/dto/eventDashboardDTO";
import { IeventRepository } from "../../../domain/interfaces/repositoryInterfaces/event/IeventRepository";
import { IeventGraphUseCase } from "../../../domain/interfaces/useCaseInterfaces/admin/dashboard/IeventGraphUseCase";

export class EventGraphUseCase implements IeventGraphUseCase {
    private eventDatabase: IeventRepository
    constructor(eventDatabase: IeventRepository) {
        this.eventDatabase = eventDatabase
    }
    async eventGraphDetails(): Promise<EventDashboardDTO> {
        return await this.eventDatabase.eventDetailsForAdminDashboard()
    }
}