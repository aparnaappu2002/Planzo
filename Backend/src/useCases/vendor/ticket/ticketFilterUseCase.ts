import { TicketAndUserDTO } from "../../../domain/dto/ticket/ticketAndUseDTO";
import { IticketRepositoryInterface } from "../../../domain/interfaces/repositoryInterfaces/ticket/IticketRepository";
import { IticketFilterUseCase } from "../../../domain/interfaces/useCaseInterfaces/vendor/ticket/IticketFilterUseCase";

export class TicketFilterUseCase implements IticketFilterUseCase {
    private ticketDatabase: IticketRepositoryInterface;
    
    constructor(ticketDatabase: IticketRepositoryInterface) {
        this.ticketDatabase = ticketDatabase;
    }
    
    async filterTickets(
        vendorId: string,
        pageNo: number,
        paymentStatus?: 'pending' | 'successful' | 'failed',
        ticketStatus?: 'used' | 'refunded' | 'unused'
    ): Promise<{ ticketAndEventDetails: TicketAndUserDTO[] | [], totalPages: number }> {
        
        if (!vendorId || vendorId.trim().length === 0) {
            throw new Error('Vendor ID is required');
        }
        return await this.ticketDatabase.filterTickets(vendorId, pageNo, paymentStatus, ticketStatus);
    }
}