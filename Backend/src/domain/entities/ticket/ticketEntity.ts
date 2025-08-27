import { ObjectId } from "mongoose";

export interface TicketEntity {
    _id?: ObjectId | string
    ticketId: string;
    totalAmount: number
    ticketCount: number
    phone: string;
    email: string;
    paymentStatus: 'pending' | 'successful' | 'failed' | 'refunded';
    qrCodeLink: string;
    eventId: ObjectId | string;
    clientId: ObjectId | string;
    ticketVariant: string
    ticketStatus: 'used' | 'refunded' | 'unused'
    paymentTransactionId: ObjectId | string
    checkInHistory?: Date[]
}