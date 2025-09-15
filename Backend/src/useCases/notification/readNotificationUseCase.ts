import { InotificationRepository } from "../../domain/interfaces/repositoryInterfaces/notification/InotificationRepository";
import { IreadNotificationUseCase } from "../../domain/interfaces/useCaseInterfaces/notification/IreadNotificationUseCase";

export class ReadNotificationUseCase implements IreadNotificationUseCase {
    private notificationDatabase: InotificationRepository
    constructor(notificationDatabase: InotificationRepository) {
        this.notificationDatabase = notificationDatabase
    }
    async readNotification(notificationId: string): Promise<boolean> {
        return await this.notificationDatabase.readNotification(notificationId)
    }
}