import { ChatEntityDTO } from "../../../entities/chat/chatEntityDTO"

export interface IfindChatsOfUserUseCase {
    findChatsOfUser(userId: string,pageNo:number): Promise<{ chats: ChatEntityDTO[], hasMore: boolean }>
}