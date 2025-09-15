import { MessageEntity } from "../../domain/entities/chat/messageEntity";
import { ImessageRepostiory } from "../../domain/interfaces/repositoryInterfaces/message/ImessageRepsitory";
import { IloadPreviousChatUseCase } from "../../domain/interfaces/useCaseInterfaces/message/IloadPreviousChatUseCase";

export class LoadPreviousChatUseCase implements IloadPreviousChatUseCase {
    private messageDatabase: ImessageRepostiory
    constructor(messageDatabase: ImessageRepostiory) {
        this.messageDatabase = messageDatabase
    }
    async loadPreviousChat(chatId: string, pageNo: number): Promise<{ messages: MessageEntity[]; hasMore: boolean; }> {
        return await this.messageDatabase.getMessagesOfAChat(chatId, pageNo)
    }
}