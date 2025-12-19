import { MessageEntity } from "../../../domain/entities/chat/messageEntity";
import { ImessageRepostiory } from "../../../domain/interfaces/repositoryInterfaces/message/ImessageRepsitory";
import { messageModel } from "../../../framework/database/models/messageModel";

export class MessageRepository implements ImessageRepostiory {
    async createMessage(message: MessageEntity): Promise<MessageEntity> {
        return await messageModel.create(message)
    }
    async getMessages(senderId: string): Promise<MessageEntity[] | []> {
        return await messageModel.find({ senderId }).select('-__v -createdAt -updatedAt')
    }
    async getMessagesOfAChat(chatId: string, pageNo: number): Promise<{ messages: MessageEntity[], hasMore: boolean }> {
        const page = Math.max(pageNo, 1)
        const limit = 10
        const skip = (page - 1) * limit
        const messages = await messageModel.find({ chatId }).select('-__v -createdAt -updatedAt').sort({ sendedTime: -1 }).skip(skip).limit(limit)
        const totalMessages = await messageModel.countDocuments({ chatId })
        const hasMore = (skip + messages.length) < totalMessages
        return { messages, hasMore }
    }
    async updateMessagesSeenStatus(messageIds: string[], chatId: string): Promise<void> {
        await messageModel.updateMany(
            {
                _id: { $in: messageIds },
                chatId: chatId,
                seen: false
            },
            {
                $set: { seen: true }
            }
        );
    }

}