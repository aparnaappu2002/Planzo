
import { TicketAndVendorDTO } from "../../../../entities/ticket/ticketAndVendorDTO"
export interface ITicketCancelUseCase {
    ticketCancel(ticketId: string): Promise<TicketAndVendorDTO>
}