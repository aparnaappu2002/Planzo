"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentSchema = void 0;
const mongoose_1 = require("mongoose");
exports.paymentSchema = new mongoose_1.Schema({
    amount: {
        type: Number,
        required: true
    },
    bookingId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'bookings'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    currency: {
        type: String,
        required: true
    },
    paymentId: {
        type: String,
        required: true
    },
    purpose: {
        type: String,
        enum: ['ticketBooking', 'serviceBooking']
    },
    receiverId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'vendors'
    },
    status: {
        type: String,
        enum: ['pending', 'success', 'failed']
    },
    ticketId: {
        type: String,
        required: false
    },
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'client',
        required: true
    },
});
