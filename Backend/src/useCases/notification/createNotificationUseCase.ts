import { NotificationEntity } from "../../domain/entities/notificationEntity";
import { InotificationRepository } from "../../domain/interfaces/repositoryInterfaces/notification/InotificationRepository";
import { IcreateNotificationUseCase } from "../../domain/interfaces/useCaseInterfaces/notification/IcreateNotificationUseCase";

export class CreateNotificationUseCase implements IcreateNotificationUseCase {
    private notificationDatabase: InotificationRepository
    constructor(notificationDatabase: InotificationRepository) {
        this.notificationDatabase = notificationDatabase
    }
    async createNotification(notification: NotificationEntity): Promise<NotificationEntity> {
        return await this.notificationDatabase.createNotification(notification)
    }
}