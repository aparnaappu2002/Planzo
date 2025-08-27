import { TicketEntity } from "../../../../entities/ticket/ticketEntity";

export interface IconfirmTicketAndPaymentUseCase {
    confirmTicketAndPayment(
        tickets: TicketEntity[], 
        paymentIntent: string, 
        vendorId: string
    ): Promise<TicketEntity[]>
}