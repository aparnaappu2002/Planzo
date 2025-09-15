import { MessageEntity } from "../../../entities/chat/messageEntity"

export interface IgetMessagesOfAChatUseCase {
    getMessages(chatId: string,pageNo:number):  Promise<{ messages: MessageEntity[], hasMore: boolean }>
}