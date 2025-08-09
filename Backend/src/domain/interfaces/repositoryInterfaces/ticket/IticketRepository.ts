import { ObjectId } from "mongoose";
import { TicketEntity } from "../../../entities/ticket/ticketEntity";


export interface IticketRepositoryInterface {
    createTicket(ticket: TicketEntity): Promise<TicketEntity>
    updatePaymentstatus(ticketId: string | ObjectId): Promise<TicketEntity | null>
    // findBookedTicketsOfClient(userId: string, pageNo: number): Promise<{ ticketAndEventDetails: TicketAndEventDTO[] | [], totalPages: number }>
    // findTicketUsingTicketId(ticketId: string): Promise<TicketEntity | null>
    // changeUsedStatus(ticketId: string): Promise<TicketEntity | null>
    // ticketCancellation(ticketId: string): Promise<TicketAndVendorDTO | null>
    // ticketAndUserDetails(eventId: string, vendorId: string, pageNo: number): Promise<{ticketAndEventDetails:TicketAndUserDTO[] | [] , totalPages:number}>
    // updateCheckInHistory(ticketId:string,date:Date):Promise<boolean>
}