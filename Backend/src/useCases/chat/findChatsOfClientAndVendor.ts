import { chatEntity } from "../../domain/entities/chat/chatEntity";
import { IchatRepository } from "../../domain/interfaces/repositoryInterfaces/chat/IchatRepository";
import { IfindChatsBetweenClientAndVendorUseCase } from "../../domain/interfaces/useCaseInterfaces/chat/IfindChatOfClientAndVendor";

export class FindChatBetweenClientAndVendorUseCase implements IfindChatsBetweenClientAndVendorUseCase {
    private chatDatabase: IchatRepository
    constructor(chatDatabase: IchatRepository) {
        this.chatDatabase = chatDatabase
    }
    async findChatBetweenClientAndVendor(senderId: string, receiverId: string): Promise<chatEntity | null> {
        return await this.chatDatabase.getChatsOfParticularUsers(senderId, receiverId)

    }
}