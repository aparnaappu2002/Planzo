import { ObjectId } from "mongoose";
import { TicketEntity } from "../../../entities/ticket/ticketEntity";
import { TicketAndEventDTO } from "../../../entities/ticket/ticketAndEventDTO";
import { TicketAndVendorDTO } from "../../../entities/ticket/ticketAndVendorDTO";
import { TicketAndUserDTO } from "../../../entities/ticket/ticketAndUseDTO";


export interface IticketRepositoryInterface {
    createTicket(ticket: TicketEntity): Promise<TicketEntity>
    updatePaymentstatus(ticketId: string | ObjectId): Promise<TicketEntity | null>
    findBookedTicketsOfClient(userId: string, pageNo: number): Promise<{ ticketAndEventDetails: TicketAndEventDTO[] | [], totalPages: number }>
    ticketCancel(ticketId: string): Promise<TicketAndVendorDTO | null>
    checkUserTicketLimit(clientId: string, eventId: string, ticketVariant: 'standard' | 'premium' | 'vip', requestedQuantity: number): Promise<{ canBook: boolean; remainingLimit: number; maxPerUser: number }>
    ticketAndUserDetails(vendorId: string, pageNo: number): Promise<{ticketAndEventDetails:TicketAndUserDTO[] | [] , totalPages:number}>
    findTicketUsingTicketId(ticketId: string): Promise<TicketEntity | null>
    changeUsedStatus(ticketId: string): Promise<TicketEntity | null>
    updateCheckInHistory(ticketId:string,date:Date):Promise<boolean>
}