import { TicketEntity } from "../../../../entities/ticket/ticketEntity"

export interface IticketVerificationUseCase {
    verifyTicket(ticketId: string, eventId: string, vendorId: string): Promise<TicketEntity>
}