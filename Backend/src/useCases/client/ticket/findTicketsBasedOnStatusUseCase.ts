
import { IticketRepositoryInterface } from "../../../domain/interfaces/repositoryInterfaces/ticket/IticketRepository";
import { IfindTicketsByStatus } from "../../../domain/interfaces/useCaseInterfaces/client/ticket/IfindTicketBasedOnStatusUseCase";
import { TicketAndUserDTO } from "../../../domain/dto/ticket/ticketAndUseDTO";



export class FindTicketsByStatusUseCase implements IfindTicketsByStatus {
    private ticketDatabase: IticketRepositoryInterface;
    
    constructor(ticketDatabase: IticketRepositoryInterface) {
        this.ticketDatabase = ticketDatabase;
    }
    
    async findTicketsByStatus(
        ticketStatus: 'used' | 'refunded' | 'unused',
        paymentStatus: 'pending' | 'successful' | 'failed' | 'refunded',
        pageNo: number,
        sortBy: string
    ): Promise<{ tickets: TicketAndUserDTO[] | []; totalPages: number; }> {
        const { tickets, totalPages } = await this.ticketDatabase.getTicketsByStatus(ticketStatus, paymentStatus, pageNo, sortBy);
        return { tickets, totalPages };
    }
}
