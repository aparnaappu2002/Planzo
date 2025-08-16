import { ObjectId } from "mongoose";
import { TicketEntity } from "../../../entities/ticket/ticketEntity";
import { TicketAndEventDTO } from "../../../entities/ticket/ticketAndEventDTO";
import { TicketAndVendorDTO } from "../../../entities/ticket/ticketAndVendorDTO";


export interface IticketRepositoryInterface {
    createTicket(ticket: TicketEntity): Promise<TicketEntity>
    updatePaymentstatus(ticketId: string | ObjectId): Promise<TicketEntity | null>
    findBookedTicketsOfClient(userId: string, pageNo: number): Promise<{ ticketAndEventDetails: TicketAndEventDTO[] | [], totalPages: number }>
    ticketCancel(ticketId: string): Promise<TicketAndVendorDTO | null>
}