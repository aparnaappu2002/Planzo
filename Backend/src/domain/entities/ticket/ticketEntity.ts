import { ObjectId } from "mongoose";
import { TicketVariant } from "./ticketVariantEntity";

export interface TicketEntity {
    _id?: ObjectId | string
    ticketId: string;
    totalAmount: number
    ticketCount: number
    phone: string;
    email: string;
    ticketVariants: TicketVariant[];
    paymentStatus: 'pending' | 'successful' | 'failed' | 'refunded';
    qrCodeLink: string;
    eventId: ObjectId | string;
    clientId: ObjectId | string;
    ticketStatus: 'used' | 'refunded' | 'unused'
    paymentTransactionId: ObjectId | string
    checkInHistory?: Date[],
}