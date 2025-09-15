import { ObjectId } from "mongoose";

export interface chatEntity {
    _id?: ObjectId,
    lastMessage: string,
    lastMessageAt: string,
    senderId: ObjectId | string,
    receiverId: ObjectId | string
    senderModel: 'client' | 'vendors'
    receiverModel: 'client' | 'vendors'
}