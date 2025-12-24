import { ObjectId } from "mongoose";

export interface PaymentEntity {
    _id?: ObjectId
    userId: ObjectId | string;
    receiverId: ObjectId | string;
    bookingId?: ObjectId | string;
    ticketId?:string;
    amount: number;
    currency: string;
    purpose: 'ticketBooking' | 'serviceBooking' | 'cancelTicket'
    status: 'pending' | 'success' | 'failed';
    paymentId: string;
    paymentIntentId?:string;
    createdAt?: Date
}