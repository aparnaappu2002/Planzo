import { TicketAndEventDTO } from "../../../../entities/ticket/ticketAndEventDTO"

export interface IshowTicketAndEventClientUseCaseInterface {
    showTicketAndEvent(userId: string, pageNo: number): Promise<{ ticketAndEventDetails: TicketAndEventDTO[] | [], totalPages: number }>
}