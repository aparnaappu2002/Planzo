import { TicketAndVendorDTO } from "../../../../dto/ticket/ticketAndVendorDTO";

export interface ITicketCancelUseCase {
    ticketCancel(ticketId: string, refundMethod?: 'wallet' | 'bank'): Promise<TicketAndVendorDTO>;
}
