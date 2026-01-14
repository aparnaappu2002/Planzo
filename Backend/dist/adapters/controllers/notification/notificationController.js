"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationController = void 0;
const httpStatus_1 = require("../../../domain/enums/httpStatus");
class NotificationController {
    constructor(readNotificationUseCase, deleteSingleNotificationUseCase, deleteAllNotificationUseCase) {
        this.readNotificationUseCase = readNotificationUseCase;
        this.deleteSingleNotificationUseCase = deleteSingleNotificationUseCase;
        this.deleteAllNotificationUseCase = deleteAllNotificationUseCase;
    }
    handleReadNotification(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { notificationId } = req.body;
                yield this.readNotificationUseCase.readNotification(notificationId);
                res.status(httpStatus_1.HttpStatus.OK).json({
                    message: 'Notification readed'
                });
            }
            catch (error) {
                console.log('error while reading notification', error);
                res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({
                    message: 'error while reading notification',
                    error: error instanceof Error ? error.message : 'error while reading notification'
                });
            }
        });
    }
    handleDeleteSingleNotification(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { notficationId } = req.query;
                if (!notficationId) {
                    res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({ error: 'No notification id is found' });
                    return;
                }
                yield this.deleteSingleNotificationUseCase.deleteSingleNotification(notficationId === null || notficationId === void 0 ? void 0 : notficationId.toString());
                res.status(httpStatus_1.HttpStatus.OK).json({ message: "Notification deleted" });
            }
            catch (error) {
                console.log('error while deleting single notification', error);
                res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({
                    message: "error while deleting single notfication",
                    error: error instanceof Error ? error.message : 'error while deleting single notification'
                });
            }
        });
    }
    handleDeleteAllNotification(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { userId } = req.query;
                if (!userId) {
                    res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({ error: 'No userId found' });
                    return;
                }
                yield this.deleteAllNotificationUseCase.deleteAllNotifications(userId.toString());
                res.status(httpStatus_1.HttpStatus.OK).json({ message: "Notificaitons deleted" });
            }
            catch (error) {
                console.log('error while deleting all notification', error);
                res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({
                    message: 'error while deleting all notifcations',
                    error: error instanceof Error ? error.message : 'error while deleting all notifcations'
                });
            }
        });
    }
}
exports.NotificationController = NotificationController;
