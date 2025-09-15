import { MessageEntity } from "../../domain/entities/chat/messageEntity";
import { ImessageRepostiory } from "../../domain/interfaces/repositoryInterfaces/message/ImessageRepsitory";
import { IcreateMessageUseCase } from "../../domain/interfaces/useCaseInterfaces/message/IcreateMessageUseCase";

export class CreateMessageUseCase implements IcreateMessageUseCase {
    private messageDatabase: ImessageRepostiory
    constructor(messageDatabase: ImessageRepostiory) {
        this.messageDatabase = messageDatabase
    }
    async createMessage(message: MessageEntity): Promise<MessageEntity> {
        return this.messageDatabase.createMessage(message)
    }
}