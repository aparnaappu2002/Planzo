import { NotificationEntity } from "../../../entities/notificationEntity"

export interface IcreateNotificationUseCase {
    createNotification(notification: NotificationEntity): Promise<NotificationEntity>
}