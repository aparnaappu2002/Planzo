import { ObjectId } from "mongoose";
import { chatEntity } from "../../../entities/chat/chatEntity";
import { MessageEntity } from "../../../entities/chat/messageEntity";
import { ChatEntityDTO } from "../../../dto/chatEntityDTO";

export interface IchatRepository {
    createChat(chat: chatEntity): Promise<chatEntity>
    getchatsOfUser(userId: string | ObjectId, pageNo: number): Promise<{ chats: ChatEntityDTO[], hasMore: boolean }>
    getChatsOfParticularUsers(senderId: string | ObjectId, receiverId: string | ObjectId): Promise<chatEntity | null>
    updateLastMessage(message: MessageEntity): Promise<chatEntity | null>
    getChatId(senderId: string, receiverId: string): Promise<chatEntity | null>
}