import { chatEntity } from "../../../entities/chat/chatEntity"

export interface IcreateChatUseCase {
    createChat(chat: chatEntity): Promise<chatEntity>
}