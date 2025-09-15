import { chatEntity } from "../../../entities/chat/chatEntity";
import { MessageEntity } from "../../../entities/chat/messageEntity";

export interface IupdateLastMessageOfChatUseCase {
    udpateLastMessage(message: MessageEntity): Promise<chatEntity>
}