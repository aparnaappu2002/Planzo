import { IticketRepositoryInterface } from "../../../domain/interfaces/repositoryInterfaces/ticket/IticketRepository";
import { IcheckTicketLimitUseCaseInterface } from "../../../domain/interfaces/useCaseInterfaces/client/ticket/IcheckTicketLimitUseCaseInterface";

export class CheckTicketLimitUseCase implements IcheckTicketLimitUseCaseInterface {
    private ticketDatabase: IticketRepositoryInterface;
    
    constructor(ticketDatabase: IticketRepositoryInterface) {
        this.ticketDatabase = ticketDatabase;
    }
    
    async checkTicketLimit(
        clientId: string,
        eventId: string,
        ticketVariant: 'standard' | 'premium' | 'vip',
        requestedQuantity: number
    ): Promise<{ canBook: boolean; remainingLimit: number; maxPerUser: number }> {
        const result = await this.ticketDatabase.checkUserTicketLimit(
            clientId,
            eventId,
            ticketVariant,
            requestedQuantity
        );
        return result;
    }
}