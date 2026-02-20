import { TicketAndUserDTO } from "../../../domain/dto/ticket/ticketAndUseDTO";
import { IticketRepositoryInterface } from "../../../domain/interfaces/repositoryInterfaces/ticket/IticketRepository";
import { IticketSearchUseCase } from "../../../domain/interfaces/useCaseInterfaces/vendor/ticket/IticketSearchUseCase";

export class TicketSearchUseCase implements IticketSearchUseCase {
    private ticketDatabase: IticketRepositoryInterface;
    
    constructor(ticketDatabase: IticketRepositoryInterface) {
        this.ticketDatabase = ticketDatabase;
    }
    
    async searchTicketsByEventTitle(
        vendorId: string,
        searchTerm: string,
        pageNo: number
    ): Promise<{ ticketAndEventDetails: TicketAndUserDTO[] | [], totalPages: number }> {
        if (!vendorId || vendorId.trim().length === 0) {
            throw new Error('Vendor ID is required');
        }
        if (!searchTerm || searchTerm.trim().length === 0) {
            throw new Error('Search term is required');
        }
        return await this.ticketDatabase.searchTicketsByEventTitle(vendorId, searchTerm, pageNo);
    }
}