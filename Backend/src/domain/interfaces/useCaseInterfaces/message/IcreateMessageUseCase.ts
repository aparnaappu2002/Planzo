import { MessageEntity } from "../../../entities/chat/messageEntity"

export interface IcreateMessageUseCase {
    createMessage(message: MessageEntity): Promise<MessageEntity>
}