import { TicketAndUserDTO } from "../../../../dto/ticket/ticketAndUseDTO";
export interface IticketSearchUseCase {
    searchTicketsByEventTitle(
        vendorId: string,
        searchTerm: string,
        pageNo: number
    ): Promise<{ ticketAndEventDetails: TicketAndUserDTO[] | [], totalPages: number }>;
}