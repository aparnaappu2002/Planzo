import { TicketVariant } from "../../entities/event/eventEntity";

export interface TicketAndUserDTO {
    _id?:  string
    ticketId: string;
    totalAmount: number
    ticketCount: number
    phone: string;
    email: string;
    paymentStatus: 'pending' | 'successful' | 'failed';
    qrCodeLink: string;
    ticketVariants: TicketVariant[]; 

    eventId: {
        _id:  string
        title: string,
        description: string,
        date: Date[],
        startTime: Date,
        endTime: Date,
        status: "upcoming" | "completed" | "cancelled"
        address?: string,
        pricePerTicket: number;
        posterImage: string[];
    }
    clientId: {
        _id:   string,
        name: string
        profileImage: string
    }
    ticketStatus: 'used' | 'refunded' | 'unused'
    paymentTransactionId: string
}