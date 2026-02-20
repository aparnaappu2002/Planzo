import { Request, Response } from "express";
import { IreadNotificationUseCase } from "../../../domain/interfaces/useCaseInterfaces/notification/IreadNotificationUseCase";
import { HttpStatus } from "../../../domain/enums/httpStatus";
import { IdeleteSingleNotificationUseCase } from "../../../domain/interfaces/useCaseInterfaces/notification/IdeleteSingleNotification";
import { IdeleteAllNotificationUseCase } from "../../../domain/interfaces/useCaseInterfaces/notification/IdeleteAllNotificationUseCase";
import { handleErrorResponse,logError } from "../../../framework/services/errorHandler";

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
            logError('Error while reading notification', error);
            handleErrorResponse(req, res, error, 'Error while reading notification');
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
            logError('Error while deleting single notification', error);
            handleErrorResponse(req, res, error, 'Error while deleting single notification');
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
            logError('Error while deleting all notifications', error);
            handleErrorResponse(req, res, error, 'Error while deleting all notifications');
        }
    }
}