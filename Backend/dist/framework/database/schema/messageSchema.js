"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.messageSchema = void 0;
const mongoose_1 = require("mongoose");
exports.messageSchema = new mongoose_1.Schema({
    chatId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'chat',
        required: true
    },
    messageContent: {
        type: String,
        required: true
    },
    seen: {
        type: Boolean,
        default: false
    },
    sendedTime: {
        type: Date,
        default: Date.now
    },
    senderId: {
        type: mongoose_1.Schema.Types.ObjectId,
        refPath: 'senderModel'
    },
    senderModel: {
        type: String,
        enum: ['client', 'vendors'],
        required: true
    }
}, {
    timestamps: true
});
