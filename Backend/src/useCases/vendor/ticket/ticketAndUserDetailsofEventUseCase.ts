import { TicketAndUserDTO } from "../../../domain/dto/ticket/ticketAndUseDTO";
import { IticketRepositoryInterface } from "../../../domain/interfaces/repositoryInterfaces/ticket/IticketRepository";
import { IticketAndUserDetailsOfEventUseCase } from "../../../domain/interfaces/useCaseInterfaces/vendor/ticket/ticketAndUserDetailsOfEventUseCase";

export class TicketAndUserDetailsOfEventUseCase implements IticketAndUserDetailsOfEventUseCase {
    private ticketDatabase: IticketRepositoryInterface
    constructor(ticketDatabase: IticketRepositoryInterface) {
        this.ticketDatabase = ticketDatabase
    }
    async findTicketAndUserDetailsOfEvent( vendorId: string, pageNo: number): Promise<{ticketAndEventDetails:TicketAndUserDTO[] | [] , totalPages:number}> {
        return await this.ticketDatabase.ticketAndUserDetails( vendorId, pageNo)
    }
}