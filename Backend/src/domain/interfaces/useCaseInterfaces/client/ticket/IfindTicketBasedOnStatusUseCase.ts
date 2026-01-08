import { TicketAndUserDTO } from "../../../../dto/ticket/ticketAndUseDTO";

export interface IfindTicketsByStatus {
    findTicketsByStatus(
        ticketStatus: 'used' | 'refunded' | 'unused',
        paymentStatus: 'pending' | 'successful' | 'failed' | 'refunded',
        pageNo: number,
        sortBy: string
    ): Promise<{ tickets: TicketAndUserDTO[] | []; totalPages: number; }>;
}
