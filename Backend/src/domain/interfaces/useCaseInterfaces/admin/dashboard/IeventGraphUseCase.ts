import { EventDashboardDTO } from "../../../../dto/eventDashboardDTO";

export interface IeventGraphUseCase {
    eventGraphDetails(): Promise<EventDashboardDTO>
}