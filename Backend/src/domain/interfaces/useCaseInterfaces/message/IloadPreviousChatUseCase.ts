import { MessageEntity } from "../../../entities/chat/messageEntity"

export interface IloadPreviousChatUseCase {
    loadPreviousChat(chatId: string, pageNo: number): Promise<{ messages: MessageEntity[], hasMore: boolean }>
}