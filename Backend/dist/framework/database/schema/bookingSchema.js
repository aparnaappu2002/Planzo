"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bookingSchema = void 0;
const mongoose_1 = require("mongoose");
exports.bookingSchema = new mongoose_1.Schema({
    clientId: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        ref: 'client'
    },
    date: [{
            type: Date,
            required: true
        }],
    paymentStatus: {
        type: String,
        enum: ["Pending", "Failed", "Successfull", "Refunded"],
        default: "Pending"
    },
    serviceId: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        ref: 'service'
    },
    vendorApproval: {
        type: String,
        enum: ["Pending", "Approved", "Rejected"],
        default: 'Pending'
    },
    vendorId: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        ref: 'vendors'
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: Number,
        required: true
    },
    rejectionReason: {
        type: String,
        required: false
    },
    status: {
        type: String,
        enum: ['Pending', 'Rejected', 'Completed', 'Cancelled'],
        default: "Pending"
    },
    isComplete: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});
