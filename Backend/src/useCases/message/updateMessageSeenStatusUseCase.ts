import { ImessageRepostiory } from "../../domain/interfaces/repositoryInterfaces/message/ImessageRepsitory";
import { IupdateMessagesSeenStatusUseCase } from "../../domain/interfaces/useCaseInterfaces/message/IupdateMessageSeenStatusUseCase";

export class UpdateMessagesSeenStatusUseCase implements IupdateMessagesSeenStatusUseCase {
    constructor(private messageRepository: ImessageRepostiory) {}

    async updateSpecificMessages(messageIds: string[], chatId: string): Promise<void> {
        if (!messageIds || messageIds.length === 0) {
            throw new Error("Message IDs are required");
        }
        
        if (!chatId) {
            throw new Error("Chat ID is required");
        }

        await this.messageRepository.updateMessagesSeenStatus(messageIds, chatId);
    }
}
