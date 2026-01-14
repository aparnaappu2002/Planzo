"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VendorSchema = void 0;
const mongoose_1 = require("mongoose");
exports.VendorSchema = new mongoose_1.Schema({
    vendorId: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phone: {
        type: Number,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    idProof: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ["active", "block"],
        default: "active"
    },
    role: {
        type: String,
        enum: ["client", "vendor"],
        default: "vendor"
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastLogin: {
        type: Date,
        default: Date.now
    },
    profileImage: {
        type: String,
        required: false
    },
    onlineStatus: {
        type: String,
        enum: ["online", "offline"],
        default: "offline"
    },
    vendorStatus: {
        type: String,
        enum: ["pending", "rejected", "approved"],
        default: "pending"
    },
    rejectionReason: {
        type: String,
        required: false
    }
}, {
    timestamps: true
});
