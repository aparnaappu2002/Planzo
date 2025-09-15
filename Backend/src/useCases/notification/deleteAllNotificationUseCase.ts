import { InotificationRepository } from "../../domain/interfaces/repositoryInterfaces/notification/InotificationRepository";
import { IdeleteAllNotificationUseCase } from "../../domain/interfaces/useCaseInterfaces/notification/IdeleteAllNotificationUseCase";

export class DeleteAllNotificationsUseCase implements IdeleteAllNotificationUseCase {
    private notificationDatabase: InotificationRepository
    constructor(notificationDatabase: InotificationRepository) {
        this.notificationDatabase = notificationDatabase
    }
    async deleteAllNotifications(userId: string): Promise<boolean> {
        return await this.notificationDatabase.deleteNotifications(userId)
    }
}