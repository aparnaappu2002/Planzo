import { ObjectId } from "mongoose";
import { chatEntity } from "../../domain/entities/chat/chatEntity";
import { IchatRepository } from "../../domain/interfaces/repositoryInterfaces/chat/IchatRepository";
import { IcreateChatUseCase } from "../../domain/interfaces/useCaseInterfaces/chat/IcreateChatUseCase";

export class CreateChatUseCase implements IcreateChatUseCase {
    private chatDatabase: IchatRepository
    constructor(chatDatabase: IchatRepository) {
        this.chatDatabase = chatDatabase
    }
    async createChat(chat: chatEntity): Promise<chatEntity> {
        const existingChat = await this.chatDatabase.getChatsOfParticularUsers(chat.senderId, chat.receiverId)
        if (existingChat) return existingChat
        const createdChat = await this.chatDatabase.createChat(chat)
        if (!createdChat) throw new Error('Error while creating new chat')
        return createdChat
    }
}