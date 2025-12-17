import { Request, Response } from "express";
import { IreadNotificationUseCase } from "../../../domain/interfaces/useCaseInterfaces/notification/IreadNotificationUseCase";
import { HttpStatus } from "../../../domain/enums/httpStatus";
import { IdeleteSingleNotificationUseCase } from "../../../domain/interfaces/useCaseInterfaces/notification/IdeleteSingleNotification";
import { IdeleteAllNotificationUseCase } from "../../../domain/interfaces/useCaseInterfaces/notification/IdeleteAllNotificationUseCase";

export class NotificationController {
    private readNotificationUseCase: IreadNotificationUseCase
    private deleteSingleNotificationUseCase:IdeleteSingleNotificationUseCase
    private deleteAllNotificationUseCase:IdeleteAllNotificationUseCase
    constructor(readNotificationUseCase: IreadNotificationUseCase,deleteSingleNotificationUseCase:IdeleteSingleNotificationUseCase,
        deleteAllNotificationUseCase:IdeleteAllNotificationUseCase) {
        this.readNotificationUseCase = readNotificationUseCase
        this.deleteSingleNotificationUseCase=deleteSingleNotificationUseCase
        this.deleteAllNotificationUseCase=deleteAllNotificationUseCase
    }
    async handleReadNotification(req: Request, res: Response): Promise<void> {
        try {
            const { notificationId } = req.body
            await this.readNotificationUseCase.readNotification(notificationId)
            res.status(HttpStatus.OK).json({
                message: 'Notification readed'
            })
        } catch (error) {
            console.log('error while reading notification', error)
            res.status(HttpStatus.BAD_REQUEST).json({
                message: 'error while reading notification',
                error: error instanceof Error ? error.message : 'error while reading notification'
            })
        }
    }
    async handleDeleteSingleNotification(req: Request, res: Response): Promise<void> {
        try {
            const { notficationId } = req.query
            if (!notficationId) {
                res.status(HttpStatus.BAD_REQUEST).json({ error: 'No notification id is found' })
                return
            }
            await this.deleteSingleNotificationUseCase.deleteSingleNotification(notficationId?.toString())
            res.status(HttpStatus.OK).json({ message: "Notification deleted" })
        } catch (error) {
            console.log('error while deleting single notification', error)
            res.status(HttpStatus.BAD_REQUEST).json({
                message: "error while deleting single notfication",
                error: error instanceof Error ? error.message : 'error while deleting single notification'
            })
        }
    }
    async handleDeleteAllNotification(req: Request, res: Response): Promise<void> {
        try {
            const { userId } = req.query
            if (!userId) {
                res.status(HttpStatus.BAD_REQUEST).json({ error: 'No userId found' })
                return
            }
            await this.deleteAllNotificationUseCase.deleteAllNotifications(userId.toString())
            res.status(HttpStatus.OK).json({ message: "Notificaitons deleted" })
        } catch (error) {
            console.log('error while deleting all notification', error)
            res.status(HttpStatus.BAD_REQUEST).json({
                message: 'error while deleting all notifcations',
                error: error instanceof Error ? error.message : 'error while deleting all notifcations'
            })
        }
    }
}