
import { TicketAndVendorDTO } from "../../../../dto/ticket/ticketAndVendorDTO"
export interface ITicketCancelUseCase {
    ticketCancel(ticketId: string): Promise<TicketAndVendorDTO>
}