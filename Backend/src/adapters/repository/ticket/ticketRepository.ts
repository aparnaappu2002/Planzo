import { Types } from "mongoose";
import { TicketEntity } from "../../../domain/entities/ticket/ticketEntity";
import { IticketRepositoryInterface } from "../../../domain/interfaces/repositoryInterfaces/ticket/IticketRepository";
import { ticketModel } from "../../../framework/database/models/ticketModel";
import { TicketAndEventDTO } from "../../../domain/entities/ticket/ticketAndEventDTO";
import { TicketAndVendorDTO } from "../../../domain/entities/ticket/ticketAndVendorDTO";


export class TicketRepository implements IticketRepositoryInterface {
    async createTicket(ticket: TicketEntity): Promise<TicketEntity> {
        return await ticketModel.create(ticket)
    }
    async updatePaymentstatus(ticketId: string): Promise<TicketEntity | null> {
        return await ticketModel.findByIdAndUpdate(ticketId, { paymentStatus: 'successful' }, { new: true })
    }
    async findBookedTicketsOfClient(userId: string, pageNo: number): Promise<{ ticketAndEventDetails: TicketAndEventDTO[] | [], totalPages: number }> {
        const page = Math.max(pageNo, 1)
        const limit = 4
        const skip = (page - 1) * limit
        const ticketAndEvent = await ticketModel.find({ clientId: userId }).select('_id ticketId ticketCount phone email paymentStatus totalAmount ticketStatus qrCodeLink')
            .populate('eventId', '_id title description date startTime endTime status address pricePerTicket posterImage').skip(skip).limit(limit).sort({ createdAt: -1 }).lean()
        const totalPages = Math.ceil(await ticketModel.countDocuments() / limit)
        const ticketAndEventDetails: TicketAndEventDTO[] = ticketAndEvent.map(ticket => {
            const event = ticket.eventId as any; 

            return {
                _id: ticket._id,
                ticketId: ticket.ticketId,
                totalAmount: ticket.totalAmount,
                ticketCount: ticket.ticketCount,
                phone: ticket.phone,
                email: ticket.email,
                paymentStatus: ticket.paymentStatus,
                ticketStatus: ticket.ticketStatus,
                qrCodeLink: ticket.qrCodeLink,
                event: {
                    _id: event._id,
                    title: event.title,
                    description: event.description,
                    date: event.date,
                    startTime: event.startTime,
                    endTime: event.endTime,
                    status: event.status,
                    address: event.address,
                    pricePerTicket: event.pricePerTicket,
                    posterImage: event.posterImage,
                }
            };
        });
        return { ticketAndEventDetails: ticketAndEventDetails, totalPages }
    }
    async ticketCancel(ticketId: string): Promise<TicketAndVendorDTO | null> {
        const ticket = await ticketModel.findByIdAndUpdate(ticketId, { ticketStatus: 'refunded' }, { new: true }).populate('eventId', 'hostedBy').lean()
        if (!ticket) return null;
        console.log('ticket in the repo', ticket)
        const result: TicketAndVendorDTO = {
            _id: ticket._id,
            ticketId: ticket.ticketId,
            totalAmount: ticket.totalAmount,
            ticketCount: ticket.ticketCount,
            phone: ticket.phone,
            email: ticket.email,
            paymentStatus: ticket.paymentStatus,
            qrCodeLink: ticket.qrCodeLink,
            eventId: {
                _id: (ticket.eventId as any)._id,
                hostedBy: (ticket.eventId as any).hostedBy,
            },
            clientId: ticket.clientId,
            ticketStatus: ticket.ticketStatus,
            paymentTransactionId: ticket.paymentTransactionId,
        };
        return result
    }
}