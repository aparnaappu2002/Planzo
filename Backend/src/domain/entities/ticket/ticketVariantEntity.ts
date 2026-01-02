import { ObjectId } from "mongoose";


export interface QRCode {
    qrId: string;
    qrCodeLink: string;
    status: 'used' | 'unused' | 'refunded';
    checkInHistory: Date[];
}

export interface TicketVariant {
    _id?: ObjectId | string; 
    variant: string
    count: number;
    pricePerTicket: number;
    subtotal: number;
    qrCodes: QRCode[];
}
