import { ChatEntityDTO } from "../../../dto/chatEntityDTO"

export interface IfindChatsOfUserUseCase {
    findChatsOfUser(userId: string,pageNo:number): Promise<{ chats: ChatEntityDTO[], hasMore: boolean }>
}