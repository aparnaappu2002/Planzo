import { TicketAndUserDTO } from "../../../../dto/ticket/ticketAndUseDTO";
export interface IticketFilterUseCase {
    filterTickets(
        vendorId: string,
        pageNo: number,
        paymentStatus?: 'pending' | 'successful' | 'failed',
        ticketStatus?: 'used' | 'refunded' | 'unused'
    ): Promise<{ ticketAndEventDetails: TicketAndUserDTO[] | [], totalPages: number }>;
}