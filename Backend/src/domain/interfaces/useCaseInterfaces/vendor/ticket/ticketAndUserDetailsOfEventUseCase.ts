import { TicketAndUserDTO } from "../../../../dto/ticket/ticketAndUseDTO"

export interface IticketAndUserDetailsOfEventUseCase {
    findTicketAndUserDetailsOfEvent( vendorId: string,pageNo:number): Promise<{ticketAndEventDetails:TicketAndUserDTO[] | [] , totalPages:number}>
}