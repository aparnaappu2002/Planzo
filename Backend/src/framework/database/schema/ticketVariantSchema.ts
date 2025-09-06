import { Schema } from "mongoose";

export const ticketVariantSchema = new Schema({
    variant: {
        type: String,
        enum: ['standard', 'premium', 'vip'],
        required: true
    },
    count: {
        type: Number,
        required: true,
        min: 1
    },
    pricePerTicket: {
        type: Number,
        required: true
    },
    subtotal: {
        type: Number,
        required: true
    },
    qrCodes: [{
        qrId: {
            type: String,
            required: true
        },
        qrCodeLink: {
            type: String,
            required: true
        },
        status: {
            type: String,
            enum: ['used', 'unused', 'refunded'],
            default: 'unused'
        },
        checkInHistory: {
            type: [Date],
            default: []
        }
    }]
}, { _id: true });
