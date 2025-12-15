import { TicketAndEventDTO } from "../../../domain/dto/ticket/ticketAndEventDTO";
import { IticketRepositoryInterface } from "../../../domain/interfaces/repositoryInterfaces/ticket/IticketRepository";
import { IshowTicketAndEventClientUseCaseInterface } from "../../../domain/interfaces/useCaseInterfaces/client/ticket/IshowEventsBookingUseCase";

export class ShowTicketAndEventClientUseCase implements IshowTicketAndEventClientUseCaseInterface {
    private ticketDatabase: IticketRepositoryInterface
    constructor(ticketDatabase: IticketRepositoryInterface) {
        this.ticketDatabase = ticketDatabase
    }
    async showTicketAndEvent(userId: string, pageNo: number): Promise<{ ticketAndEventDetails: TicketAndEventDTO[] | []; totalPages: number; }> {
        const { ticketAndEventDetails, totalPages } = await this.ticketDatabase.findBookedTicketsOfClient(userId, pageNo)
        return { ticketAndEventDetails, totalPages }
    }
}