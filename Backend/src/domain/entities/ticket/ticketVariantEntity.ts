import { ObjectId } from "mongoose";


export interface QRCode {
    qrId: string;
    qrCodeLink: string;
    status: 'used' | 'unused' | 'refunded';
    checkInHistory: Date[];
}

export interface TicketVariant {
    _id?: ObjectId | string; 
    variant: 'standard' | 'premium' | 'vip';
    count: number;
    pricePerTicket: number;
    subtotal: number;
    qrCodes: QRCode[];
}
