
export interface TicketAndVendorDTO {
    _id?:   string
    ticketId: string;
    totalAmount: number
    ticketCount: number
    phone: string;
    email: string;
    paymentStatus: 'pending' | 'successful' | 'failed' | "refunded";
    qrCodeLink: string;
    eventId: {
        _id: string
        hostedBy: string
    }
    clientId:   string;
    ticketStatus: 'used' | 'refunded' | 'unused'
    paymentTransactionId: string,
    refundMethod?: string; // Add this field
    paymentId?:string

}