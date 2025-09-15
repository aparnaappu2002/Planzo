import { MessageEntity } from "../../domain/entities/chat/messageEntity";
import { ImessageRepostiory } from "../../domain/interfaces/repositoryInterfaces/message/ImessageRepsitory";
import { IgetMessagesOfAChatUseCase } from "../../domain/interfaces/useCaseInterfaces/message/IgetMessageOfChatUseCase";

export class GetMessagesOfAChatUseCase implements IgetMessagesOfAChatUseCase {
    private messageDatabase: ImessageRepostiory
    constructor(messageDatabase: ImessageRepostiory) {
        this.messageDatabase = messageDatabase
    }
    async getMessages(chatId: string, pageNo: number): Promise<{ messages: MessageEntity[], hasMore: boolean }> {
        const { hasMore, messages } = await this.messageDatabase.getMessagesOfAChat(chatId, pageNo)
        return { messages, hasMore }
    }
}