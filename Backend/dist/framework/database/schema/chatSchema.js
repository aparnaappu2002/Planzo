"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatSchema = void 0;
const mongoose_1 = require("mongoose");
exports.chatSchema = new mongoose_1.Schema({
    lastMessage: {
        type: String
    },
    lastMessageAt: {
        type: String
    },
    receiverId: {
        type: mongoose_1.Schema.Types.ObjectId,
        refPath: 'receiverModel'
    },
    senderId: {
        type: mongoose_1.Schema.Types.ObjectId,
        refPath: 'senderModel'
    },
    receiverModel: {
        type: String,
        required: true,
        enum: ['client', 'vendors']
    },
    senderModel: {
        type: String,
        required: true,
        enum: ['client', 'vendors']
    }
}, {
    timestamps: true
});
