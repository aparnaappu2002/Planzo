import { ChatEntityDTO } from "../../domain/dto/chatEntityDTO";
import { IchatRepository } from "../../domain/interfaces/repositoryInterfaces/chat/IchatRepository";
import { IfindChatsOfUserUseCase } from "../../domain/interfaces/useCaseInterfaces/chat/IfindChatsOfUserUseCase";

export class FindChatsOfAUserUseCase implements IfindChatsOfUserUseCase {
    private chatDatabase: IchatRepository
    constructor(chatDatabase: IchatRepository) {
        this.chatDatabase = chatDatabase
    }
    async findChatsOfUser(userId: string, pageNo: number): Promise<{ chats: ChatEntityDTO[], hasMore: boolean }> {
        const { chats, hasMore } = await this.chatDatabase.getchatsOfUser(userId, pageNo)
        return { chats, hasMore }
    }
}