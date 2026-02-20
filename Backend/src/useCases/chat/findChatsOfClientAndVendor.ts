import { chatEntity } from "../../domain/entities/chat/chatEntity";
import { IchatRepository } from "../../domain/interfaces/repositoryInterfaces/chat/IchatRepository";
import { IfindChatsBetweenClientAndVendorUseCase } from "../../domain/interfaces/useCaseInterfaces/chat/IfindChatOfClientAndVendor";

export class FindChatBetweenClientAndVendorUseCase implements IfindChatsBetweenClientAndVendorUseCase {
    private chatDatabase: IchatRepository
    constructor(chatDatabase: IchatRepository) {
        this.chatDatabase = chatDatabase
    }
    async findChatBetweenClientAndVendor(senderId: string, receiverId: string): Promise<chatEntity | null> {
        if (!senderId || senderId.trim().length === 0) {
            throw new Error('Sender ID is required');
        }
        if (!receiverId || receiverId.trim().length === 0) {
            throw new Error('Receiver ID is required');
        }
        if (senderId === receiverId) {
            throw new Error('Sender and receiver cannot be the same');
        }
        
        return await this.chatDatabase.getChatsOfParticularUsers(senderId, receiverId)

    }
}