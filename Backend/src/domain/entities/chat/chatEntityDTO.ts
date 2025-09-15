import { ObjectId } from "mongoose";
import { UserInfo } from "./userInfoDTO";

export interface ChatEntityDTO {
    _id?: ObjectId;
    lastMessage: string;
    lastMessageAt: string;
    senderId: ObjectId | string | UserInfo;  
    receiverId: ObjectId | string | UserInfo; 
    senderModel: 'client' | 'vendors';
    receiverModel: 'client' | 'vendors';
}