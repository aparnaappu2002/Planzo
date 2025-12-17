import { NotificationDTO } from "../../../domain/dto/notificationDTO";
import { NotificationEntity } from "../../../domain/entities/notificationEntity";
import { InotificationRepository } from "../../../domain/interfaces/repositoryInterfaces/notification/InotificationRepository";
import { notificationModal } from "../../../framework/database/models/notificationModel";

export class NotificationRepository implements InotificationRepository {
    async createNotification(notification: NotificationEntity): Promise<NotificationEntity> {
        return notificationModal.create(notification)
    }
    async deleteNotifications(userId: string): Promise<boolean> {
        const deletedNotifications = await notificationModal.deleteMany({ to: userId });
        return deletedNotifications.deletedCount > 0;
    }
    async findNotifications(userId: string): Promise<NotificationDTO[] | {}> {
        const notifications = await notificationModal.find({ to: userId }).populate('from', '_id name profileImage')
        return notifications
    }
    async deleteSingleNotification(notificationdId: string): Promise<boolean> {
        const deleteNotification = await notificationModal.findByIdAndDelete(notificationdId)
        if (!deleteNotification) throw new Error('No notification found in this ID')
        return true
    }
    async readNotification(notificationId: string): Promise<boolean> {
        const readNotification = await notificationModal.findByIdAndUpdate(notificationId, { read: true }, { new: true })
        if (!readNotification) throw new Error('No notification found in this ID')
        return true
    }

}