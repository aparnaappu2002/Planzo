import { ObjectId } from "mongoose";
import { chatEntity } from "../../../domain/entities/chat/chatEntity";
import { IchatRepository } from "../../../domain/interfaces/repositoryInterfaces/chat/IchatRepository";
import { chatModel } from "../../../framework/database/models/chatModel";
import { MessageEntity } from "../../../domain/entities/chat/messageEntity";
import { ChatEntityDTO } from "../../../domain/dto/chatEntityDTO";

export class ChatRepository implements IchatRepository {
    async createChat(chat: chatEntity): Promise<chatEntity> {
        return chatModel.create(chat)
    }
   
    async getchatsOfUser(userId: string | ObjectId, pageNo: number): Promise<{ chats: ChatEntityDTO[], hasMore: boolean }> {
        const limit = 10
        const page = Math.max(pageNo, 1)
        const skip = (page - 1) * limit
        const chatsResult = await chatModel.find({
            $or: [
                { senderId: userId },
                { receiverId: userId }
            ]
        }).sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('senderId', 'name profileImage') 
            .populate('receiverId', 'name profileImage')

        const totalChats = await chatModel.countDocuments({
            $or: [
                { senderId: userId },
                { receiverId: userId }
            ]
        });

        const hasMore = (skip + chatsResult.length) < totalChats;
        const chats: ChatEntityDTO[] = chatsResult.map(chat => ({
        _id: chat._id.toString(),
        lastMessage: chat.lastMessage,
        lastMessageAt: chat.lastMessageAt,
        senderId: {
            _id: (chat.senderId as any)._id.toString(),
            name: (chat.senderId as any).name,
            profileImage: (chat.senderId as any).profileImage
        },
        receiverId: {
            _id: (chat.receiverId as any)._id.toString(),
            name: (chat.receiverId as any).name,
            profileImage: (chat.receiverId as any).profileImage
        },
        senderModel: chat.senderModel,
        receiverModel: chat.receiverModel
    }));

        return { chats, hasMore };

    }
    async getChatsOfParticularUsers(senderId: string | ObjectId, receiverId: string | ObjectId): Promise<chatEntity | null> {
        return await chatModel.findOne({
            $or: [
                { senderId: senderId, receiverId: receiverId },
                { senderId: receiverId, receiverId: senderId }
            ]
        });
    }
    async updateLastMessage(message: MessageEntity): Promise<chatEntity | null> {
        return await chatModel.findByIdAndUpdate(message.chatId, { lastMessage: message.messageContent, lastMessageAt: message.sendedTime }, { new: true })
    }
    async getChatId(senderId: string, receiverId: string): Promise<chatEntity | null> {
        return await chatModel.findOne({
            $or: [
                { senderId: senderId, receiverId: receiverId },
                { senderId: receiverId, receiverId: senderId }
            ]
        }).select('_id chatId').lean() as chatEntity | null
    }
    
}