import { TicketAndUserDTO } from "../../../../entities/ticket/ticketAndUseDTO"

export interface IticketAndUserDetailsOfEventUseCase {
    findTicketAndUserDetailsOfEvent( vendorId: string,pageNo:number): Promise<{ticketAndEventDetails:TicketAndUserDTO[] | [] , totalPages:number}>
}