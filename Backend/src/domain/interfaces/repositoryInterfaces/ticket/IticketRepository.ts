import { ObjectId } from "mongoose";
import { TicketEntity } from "../../../entities/ticket/ticketEntity";
import { TicketAndEventDTO } from "../../../dto/ticket/ticketAndEventDTO";
import { TicketAndVendorDTO } from "../../../dto/ticket/ticketAndVendorDTO";
import { TicketAndUserDTO } from "../../../dto/ticket/ticketAndUseDTO";


export interface IticketRepositoryInterface {
    createTicket(ticket: TicketEntity): Promise<TicketEntity>
    updatePaymentstatus(ticketId: string | ObjectId): Promise<TicketEntity | null>
    findBookedTicketsOfClient(userId: string, pageNo: number): Promise<{ ticketAndEventDetails: TicketAndEventDTO[] | [], totalPages: number }>
    ticketCancel(ticketId: string, refundMethod?: string): Promise<TicketAndVendorDTO | null>
    checkUserTicketLimit(clientId: string, eventId: string, ticketVariant: 'standard' | 'premium' | 'vip', requestedQuantity: number): Promise<{ canBook: boolean; remainingLimit: number; maxPerUser: number }>
    ticketAndUserDetails(vendorId: string, pageNo: number): Promise<{ticketAndEventDetails:TicketAndUserDTO[] | [] , totalPages:number}>
    findTicketUsingTicketId(ticketId: string): Promise<TicketEntity | null>
    changeUsedStatus(ticketId: string): Promise<TicketEntity | null>
    updateCheckInHistory(ticketId:string,date:Date):Promise<boolean>
    getTicketsByStatus(
        ticketStatus: 'used' | 'refunded' | 'unused',
        paymentStatus: 'pending' | 'successful' | 'failed' | 'refunded',
        pageNo: number,
        sortBy: string
    ): Promise<{ tickets: TicketAndUserDTO[] | []; totalPages: number; }>
}