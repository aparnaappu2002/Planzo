"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ticketSchema = void 0;
const mongoose_1 = require("mongoose");
const ticketVariantSchema_1 = require("./ticketVariantSchema");
exports.ticketSchema = new mongoose_1.Schema({
    ticketId: {
        type: String,
        required: true
    },
    clientId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "client",
        required: true
    },
    email: {
        type: String,
        required: true
    },
    eventId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'event',
        required: true
    },
    ticketVariants: {
        type: [ticketVariantSchema_1.ticketVariantSchema],
        required: true
    },
    ticketCount: {
        type: Number,
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ["pending", "successfull", "failed", "refunded"]
    },
    phone: {
        type: String,
        required: false
    },
    qrCodeLink: {
        type: String,
        required: true
    },
    ticketStatus: {
        type: String,
        enum: ['used', 'refunded', 'unused']
    },
    paymentTransactionId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'payment',
        required: true
    },
    totalAmount: {
        type: Number,
        required: true
    },
    checkInHistory: {
        type: [Date],
        default: []
    }
}, {
    timestamps: true
});
