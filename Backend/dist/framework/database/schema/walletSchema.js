"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.walletSchema = void 0;
const mongoose_1 = require("mongoose");
exports.walletSchema = new mongoose_1.Schema({
    balance: {
        type: Number,
        required: false,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'userModel',
        required: true
    },
    userModel: {
        type: String,
        required: true,
        enum: ['client', 'vendors']
    },
    walletId: {
        type: String,
        required: true
    },
}, {
    timestamps: true
});
