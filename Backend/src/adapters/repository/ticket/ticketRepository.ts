import { Types } from "mongoose";
import { TicketEntity } from "../../../domain/entities/ticket/ticketEntity";
import { IticketRepositoryInterface } from "../../../domain/interfaces/repositoryInterfaces/ticket/IticketRepository";
import { ticketModel } from "../../../framework/database/models/ticketModel";
import { TicketAndEventDTO } from "../../../domain/entities/ticket/ticketAndEventDTO";
import { TicketAndVendorDTO } from "../../../domain/entities/ticket/ticketAndVendorDTO";
import { eventModal } from "../../../framework/database/models/eventModel";
import { TicketAndUserDTO } from "../../../domain/entities/ticket/ticketAndUseDTO";

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
        ticketModel.find(filter).select('_id ticketId ticketCount phone email paymentStatus totalAmount ticketStatus qrCodeLink ticketVariants')
            .populate('eventId', '_id title description date startTime endTime status address pricePerTicket posterImage')
            .skip(skip).limit(limit).sort({ createdAt: -1 }).lean(),
        ticketModel.countDocuments(filter)
    ])
    
    const totalPages = Math.ceil(totalItems / limit)
    
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
            ticketVariants: ticket.ticketVariants || [], 
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

    // Find the specific ticket variant
    const variant = event.ticketVariants.find(v => v.type === ticketVariant);
    
    if (!variant) {
        return {
            canBook: false,
            remainingLimit: 0,
            maxPerUser: 0
        };
    }

    // Count existing tickets for this user, event, and variant (excluding refunded tickets)
    const existingTicketsCount = await ticketModel.aggregate([
        {
            $match: {
                clientId: new Types.ObjectId(clientId),
                eventId: new Types.ObjectId(eventId),
                ticketVariant: ticketVariant,
                ticketStatus: { $ne: 'refunded' }
            }
        },
        {
            $group: {
                _id: null,
                totalTickets: { $sum: '$ticketCount' }
            }
        }
    ]);

    const currentTicketCount = existingTicketsCount.length > 0 ? existingTicketsCount[0].totalTickets : 0;
    const maxAllowed = variant.maxPerUser;
    const remainingLimit = maxAllowed - currentTicketCount;

    // Check if the requested quantity exceeds the remaining limit
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
        // Add sorting stage BEFORE pagination - sorts by creation time (newest first)
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
        // Add sorting stage BEFORE pagination
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
    
    // Count total documents with the same filter
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

