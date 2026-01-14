"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transactionSchema = void 0;
const mongoose_1 = require("mongoose");
exports.transactionSchema = new mongoose_1.Schema({
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    paymentStatus: {
        type: String,
        enum: ["debit", "credit"]
    },
    paymentType: {
        type: String,
        enum: ["refund", "ticketBooking", "top-up", "bookingPayment", "adminCommission", "stripe_refund"]
    },
    walletId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'wallet',
        required: true
    }
}, {
    timestamps: true
});
