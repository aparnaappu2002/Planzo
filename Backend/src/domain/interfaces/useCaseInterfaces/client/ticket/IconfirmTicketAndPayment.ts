import { TicketEntity } from "../../../../entities/ticket/ticketEntity";

export interface IconfirmTicketAndPaymentUseCase {
    confirmTicketAndPayment(
        ticket: TicketEntity, 
        paymentIntent: string, 
        vendorId: string
    ): Promise<TicketEntity>;
}