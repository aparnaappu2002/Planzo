import { MessageEntity } from "../../../entities/chat/messageEntity"

export interface ImessageRepostiory {
    createMessage(message: MessageEntity): Promise<MessageEntity>
    getMessages(senderId: string): Promise<MessageEntity[] | []>
    getMessagesOfAChat(chatId: string,pageNo:number): Promise<{ messages: MessageEntity[], hasMore: boolean }>
    updateMessagesSeenStatus(messageIds: string[], chatId: string): Promise<void>;

}