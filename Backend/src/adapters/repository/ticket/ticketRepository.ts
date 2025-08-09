import { Types } from "mongoose";
import { TicketEntity } from "../../../domain/entities/ticket/ticketEntity";
import { IticketRepositoryInterface } from "../../../domain/interfaces/repositoryInterfaces/ticket/IticketRepository";
import { ticketModel } from "../../../framework/database/models/ticketModel";

export class TicketRepository implements IticketRepositoryInterface {
    async createTicket(ticket: TicketEntity): Promise<TicketEntity> {
        return await ticketModel.create(ticket)
    }
    async updatePaymentstatus(ticketId: string): Promise<TicketEntity | null> {
        return await ticketModel.findByIdAndUpdate(ticketId, { paymentStatus: 'successful' }, { new: true })
    }
}