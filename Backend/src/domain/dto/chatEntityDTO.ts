import { UserInfo } from "./userInfoDTO";

export interface ChatEntityDTO {
    _id?: string;
    lastMessage: string;
    lastMessageAt: string;
    senderId:  UserInfo;  
    receiverId:  UserInfo; 
    senderModel: 'client' | 'vendors';
    receiverModel: 'client' | 'vendors';
}