import { Types } from "mongoose";
import { TicketEntity } from "../../../domain/entities/ticket/ticketEntity";
import { IticketRepositoryInterface } from "../../../domain/interfaces/repositoryInterfaces/ticket/IticketRepository";
import { ticketModel } from "../../../framework/database/models/ticketModel";
import { TicketAndEventDTO } from "../../../domain/dto/ticket/ticketAndEventDTO";
import { TicketAndVendorDTO } from "../../../domain/dto/ticket/ticketAndVendorDTO";
import { eventModal } from "../../../framework/database/models/eventModel";
import { TicketAndUserDTO } from "../../../domain/dto/ticket/ticketAndUseDTO";
import { paymentModel } from "../../../framework/database/models/paymentModel";

export class TicketRepository implements IticketRepositoryInterface {
    async createTicket(ticket: TicketEntity): Promise<TicketEntity> {
        return await ticketModel.create(ticket)
    }
    async updatePaymentstatus(ticketId: string): Promise<TicketEntity | null> {
        return await ticketModel.findByIdAndUpdate(ticketId, { paymentStatus: 'successful' }, { new: true })
    }
    async findBookedTicketsOfClient(userId: string, pageNo: number): Promise<{ ticketAndEventDetails: TicketAndEventDTO[] | [], totalPages: number, totalItems: number }> {
    const page = Math.max(pageNo, 1)
    const limit = 4
    const skip = (page - 1) * limit
    const filter = { clientId: userId }
    
    const [ticketAndEvent, totalItems] = await Promise.all([
        ticketModel.find(filter)
            .select('_id ticketId ticketCount phone email paymentStatus totalAmount ticketStatus qrCodeLink ticketVariants paymentTransactionId')
            .populate('eventId', '_id title description date startTime endTime status address pricePerTicket posterImage')
            .populate('paymentTransactionId', 'paymentId status purpose') // Populate payment details
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 })
            .lean(),
        ticketModel.countDocuments(filter)
    ])
    
    const totalPages = Math.ceil(totalItems / limit)
    
    const ticketAndEventDetails: TicketAndEventDTO[] = ticketAndEvent.map(ticket => {
        const event = ticket.eventId as any;
        const payment = ticket.paymentTransactionId as any;
        
        return {
            _id: ticket._id?.toString(),
            ticketId: ticket.ticketId,
            totalAmount: ticket.totalAmount,
            ticketCount: ticket.ticketCount,
            phone: ticket.phone,
            email: ticket.email,
            paymentStatus: ticket.paymentStatus,
            ticketStatus: ticket.ticketStatus,
            qrCodeLink: ticket.qrCodeLink,
            ticketVariants: ticket.ticketVariants || [],
            paymentIntentId: payment?.paymentId || null, 
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
    
    return { ticketAndEventDetails, totalPages, totalItems }
}
    async ticketCancel(
    ticketId: string, 
    refundMethod?: 'wallet' | 'bank'
): Promise<TicketAndVendorDTO | null> {
    // Update ticket status and store refund method
    const ticket = await ticketModel.findByIdAndUpdate(
        ticketId, 
        { 
            ticketStatus: 'refunded',
            refundMethod: refundMethod || 'wallet',
            refundedAt: new Date()
        }, 
        { new: true }
    )
    .populate('eventId', 'hostedBy')
    .lean()
    
    if (!ticket) return null;
    console.log('ticket in the repo', ticket)
    
    // Fetch payment details from payment entity
    let paymentId = null;
    if (ticket.paymentTransactionId) {
        const payment = await paymentModel.findById(ticket.paymentTransactionId)
            .select('paymentId status purpose')
            .lean();
        
        if (payment) {
            paymentId = payment.paymentId;
        }
    }
    
    const result: TicketAndVendorDTO = {
        _id: ticket._id?.toString(),
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
        clientId: ticket.clientId?.toString(),
        ticketStatus: ticket.ticketStatus,
        paymentTransactionId: ticket.paymentTransactionId?.toString(),
        paymentId: paymentId || undefined, // Payment ID from payment entity
        refundMethod: refundMethod || 'wallet',
    };
    return result
}
    async checkUserTicketLimit(
    clientId: string,
    eventId: string,
    ticketVariant: 'standard' | 'premium' | 'vip',
    requestedQuantity: number
): Promise<{ canBook: boolean; remainingLimit: number; maxPerUser: number }> {
    const event = await eventModal.findById(eventId).select('ticketVariants').lean();
   
    if (!event) {
        return {
            canBook: false,
            remainingLimit: 0,
            maxPerUser: 0
        };
    }

    const variant = event.ticketVariants.find(v => v.type === ticketVariant);
   
    if (!variant) {
        return {
            canBook: false,
            remainingLimit: 0,
            maxPerUser: 0
        };
    }

    
    const result = await ticketModel.aggregate([
        {
            $match: {
                clientId: new Types.ObjectId(clientId),
                eventId: new Types.ObjectId(eventId),
                'ticketVariants.variant': ticketVariant,
                ticketStatus: { $ne: 'refunded' }
            }
        },
        {
            $unwind: '$ticketVariants'
        },
        {
            $match: {
                'ticketVariants.variant': ticketVariant
            }
        },
        {
            $group: {
                _id: null,
                totalTickets: { $sum: '$ticketVariants.count' }
            }
        }
    ]);

    const currentTicketCount = result.length > 0 ? result[0].totalTickets : 0;
    const maxAllowed = variant.maxPerUser;
    const remainingLimit = maxAllowed - currentTicketCount;
    const canBook = currentTicketCount + requestedQuantity <= maxAllowed;

    return {
        canBook,
        remainingLimit: Math.max(0, remainingLimit),
        maxPerUser: maxAllowed
    };
}


async ticketAndUserDetails(vendorId: string, pageNo: number): Promise<{ ticketAndEventDetails: TicketAndUserDTO[] | [], totalPages: number }> {
    const page = Math.max(pageNo, 1)
    const limit = 6
    const skip = (page - 1) * limit
    const matchStage: any = {
        'event.hostedBy': new Types.ObjectId(vendorId)
    };
    
    const tickets = await ticketModel.aggregate([
        {
            $lookup: {
                from: 'events',
                localField: 'eventId',
                foreignField: '_id',
                as: 'event'
            }
        },
        { $unwind: '$event' },
        {
            $match: {
                ...matchStage
            }
        },
        {
            $lookup: {
                from: 'clients',
                localField: 'clientId',
                foreignField: '_id',
                as: 'client'
            }
        },
        { $unwind: '$client' },
        {
            $addFields: {
                eventId: '$event',
                clientId: '$client'
            }
        },
        
        { $sort: { _id: -1 } },
        {
            $project: {
                _id: 1,
                ticketId: 1,
                totalAmount: 1,
                ticketCount: 1,
                phone: 1,
                email: 1,
                paymentStatus: 1,
                qrCodeLink: 1,
                ticketVariant: 1,
                ticketStatus: 1,
                paymentTransactionId: 1,
                eventId: {
                    _id: '$event._id',
                    title: '$event.title',
                    description: '$event.description',
                    date: '$event.date',
                    startTime: '$event.startTime',
                    endTime: '$event.endTime',
                    status: '$event.status',
                    address: '$event.address',
                    pricePerTicket: '$event.pricePerTicket',
                    posterImage: '$event.posterImage'
                },
                clientId: {
                    _id: '$client._id',
                    name: '$client.name',
                    profileImage: '$client.profileImage'
                }
            }
        },
        { $skip: skip },
        { $limit: limit }
    ]);
    
    const countResult = await ticketModel.aggregate([
        {
            $lookup: {
                from: 'events',
                localField: 'eventId',
                foreignField: '_id',
                as: 'event'
            }
        },
        { $unwind: '$event' },
        {
            $match: {
                'event.hostedBy': new Types.ObjectId(vendorId)
            }
        },
        { $count: 'total' }
    ]);
    
    const totalCount = countResult[0]?.total || 0;
    const totalPages = Math.ceil(totalCount / limit);
    
    return { ticketAndEventDetails: tickets, totalPages }
}



async findTicketUsingTicketId(ticketId: string): Promise<TicketEntity | null> {
    return ticketModel.findOne({ ticketId }).select('-__v')
}
async changeUsedStatus(ticketId: string): Promise<TicketEntity | null> {
    return await ticketModel.findByIdAndUpdate(ticketId, { ticketStatus: 'used' })
}
async updateCheckInHistory(ticketId: string, date: Date): Promise<boolean> {
        const result = await ticketModel.updateOne(
            { _id: ticketId },
            { $addToSet: { checkInHistory: date } }
        );

    return result.modifiedCount > 0;
}

async getTicketsByStatus(
    ticketStatus: 'used' | 'refunded' | 'unused',
    paymentStatus: 'pending' | 'successful' | 'failed' | 'refunded',
    pageNo: number,
    sortBy: string
): Promise<{ tickets: TicketAndUserDTO[] | []; totalPages: number; }> {
    const sortOptions: Record<string, any> = {
        "newest": { createdAt: -1 },
        "oldest": { createdAt: 1 },
        "amount-low-high": { totalAmount: 1 },
        "amount-high-low": { totalAmount: -1 },
        "ticket-count": { ticketCount: -1 }
    }
    const sort = sortOptions[sortBy] || { createdAt: -1 }
    const limit = 5
    const page = Math.max(pageNo, 1)
    const skip = (page - 1) * limit
    
    const matchStage = {
        ticketStatus,
        paymentStatus
    }
    
    const tickets = await ticketModel.aggregate([
        {
            $match: matchStage
        },
        {
            $lookup: {
                from: 'events',
                localField: 'eventId',
                foreignField: '_id',
                as: 'event'
            }
        },
        { $unwind: '$event' },
        {
            $lookup: {
                from: 'clients',
                localField: 'clientId',
                foreignField: '_id',
                as: 'client'
            }
        },
        { $unwind: '$client' },
        {
            $addFields: {
                eventId: '$event',
                clientId: '$client'
            }
        },
        { $sort: sort },
        {
            $project: {
                _id: 1,
                ticketId: 1,
                totalAmount: 1,
                ticketCount: 1,
                phone: 1,
                email: 1,
                paymentStatus: 1,
                qrCodeLink: 1,
                ticketVariant: 1,
                ticketStatus: 1,
                paymentTransactionId: 1,
                createdAt: 1,
                eventId: {
                    _id: '$event._id',
                    title: '$event.title',
                    description: '$event.description',
                    date: '$event.date',
                    startTime: '$event.startTime',
                    endTime: '$event.endTime',
                    status: '$event.status',
                    address: '$event.address',
                    pricePerTicket: '$event.pricePerTicket',
                    posterImage: '$event.posterImage'
                },
                clientId: {
                    _id: '$client._id',
                    name: '$client.name',
                    profileImage: '$client.profileImage'
                }
            }
        },
        { $skip: skip },
        { $limit: limit }
    ]);
    
    const countResult = await ticketModel.aggregate([
        {
            $match: matchStage
        },
        { $count: 'total' }
    ]);
    
    const totalCount = countResult[0]?.total || 0;
    const totalPages = Math.ceil(totalCount / limit);
    
    return { tickets, totalPages }
}


}

