import { Schema } from "mongoose";
import { chatEntity } from "../../../domain/entities/chat/chatEntity";

export const chatSchema = new Schema<chatEntity>({
    lastMessage: {
        type: String
    },
    lastMessageAt: {
        type: String
    },
    receiverId: {
        type: Schema.Types.ObjectId,
        refPath: 'receiverModel'
    },
    senderId: {
        type: Schema.Types.ObjectId,
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
})