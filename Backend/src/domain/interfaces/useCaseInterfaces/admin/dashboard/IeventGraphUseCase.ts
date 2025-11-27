import { EventDashboardDTO } from "../../../../entities/event/eventDashboardDTO";

export interface IeventGraphUseCase {
    eventGraphDetails(): Promise<EventDashboardDTO>
}