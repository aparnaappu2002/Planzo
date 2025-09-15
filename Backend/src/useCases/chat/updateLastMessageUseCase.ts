import { chatEntity } from "../../domain/entities/chat/chatEntity";
import { MessageEntity } from "../../domain/entities/chat/messageEntity";
import { IchatRepository } from "../../domain/interfaces/repositoryInterfaces/chat/IchatRepository";
import { IupdateLastMessageOfChatUseCase } from "../../domain/interfaces/useCaseInterfaces/chat/IupdateLastMessageUseCase";

export class UpdateLastMessageUseCase implements IupdateLastMessageOfChatUseCase {
    private chatDatabase: IchatRepository
    constructor(chatDatabase: IchatRepository) {
        this.chatDatabase = chatDatabase
    }
    async udpateLastMessage(message: MessageEntity): Promise<chatEntity> {
        const updatedChat = await this.chatDatabase.updateLastMessage(message)
        if (!updatedChat) throw new Error("No chat found in this id for updating the last message")
        return updatedChat
    }
}