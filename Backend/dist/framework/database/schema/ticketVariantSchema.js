"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ticketVariantSchema = void 0;
const mongoose_1 = require("mongoose");
exports.ticketVariantSchema = new mongoose_1.Schema({
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
