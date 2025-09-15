import { NotificationRepository } from "../../adapters/repository/notification/notificationRepository";
import { IdeleteSingleNotificationUseCase } from "../../domain/interfaces/useCaseInterfaces/notification/IdeleteSingleNotification";

export class DeleteSingleNotificationUseCase implements IdeleteSingleNotificationUseCase {
    private notificationDatabase: NotificationRepository
    constructor(notificationDatabase: NotificationRepository) {
        this.notificationDatabase = notificationDatabase
    }
    async deleteSingleNotification(notificationdId: string): Promise<boolean> {
        return await this.notificationDatabase.deleteSingleNotification(notificationdId)
    }
}