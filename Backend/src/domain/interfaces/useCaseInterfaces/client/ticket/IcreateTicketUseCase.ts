import { TicketEntity } from "../../../../entities/ticket/ticketEntity";
import { TicketFromFrontend } from "../../../../entities/ticket/ticketFromFrontend";

export interface IcreateTicketUseCase {
    createTicket(
        ticketData: TicketFromFrontend,
        totalCount: number,
        totalAmount: number,
        vendorId: string
    ): Promise<{ 
        createdTicket: TicketEntity; 
        clientSecret: string; 
        paymentIntentId: string 
    }>;
}