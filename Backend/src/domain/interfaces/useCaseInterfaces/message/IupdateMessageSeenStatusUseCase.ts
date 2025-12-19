export interface IupdateMessagesSeenStatusUseCase {
    updateSpecificMessages(messageIds: string[], chatId: string): Promise<void>;
}
