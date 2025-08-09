import { TicketEntity } from "../../../../entities/ticket/ticketEntity";
import { TicketFromFrontend } from "../../../../entities/ticket/ticketFromFrontend";

export interface IcreateTicketUseCase {
    createTicket(ticket: TicketFromFrontend, totalCount: number, totalAmount: number, paymentIntentId: string, vendorId: string): Promise<{createdTicket:TicketEntity,stripeClientId:string}>
}