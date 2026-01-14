"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clientSchema = void 0;
const mongoose_1 = require("mongoose");
exports.clientSchema = new mongoose_1.Schema({
    clientId: {
        type: String,
        required: false
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: Number,
        required: false
    },
    password: {
        type: String,
        required: false
    },
    profileImage: {
        type: String,
        required: false
    },
    createdAt: {
        type: Date,
        required: false
    },
    status: {
        type: String,
        enum: ['active', 'block'],
        default: 'active'
    },
    role: {
        type: String,
        enum: ["client", "vendor", "admin"],
        default: 'client'
    },
    lastLogin: {
        type: Date,
        default: Date.now
    },
    onlineStatus: {
        type: String,
        enum: ['onine', 'offline'],
        default: 'offline'
    },
    isAdmin: {
        type: Boolean,
        default: false,
        required: false
    },
    googleVerified: {
        type: Boolean,
        default: false,
        required: false
    }
}, {
    timestamps: true
});
