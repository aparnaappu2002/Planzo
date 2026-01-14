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
exports.NotificationRepository = void 0;
const notificationModel_1 = require("../../../framework/database/models/notificationModel");
class NotificationRepository {
    createNotification(notification) {
        return __awaiter(this, void 0, void 0, function* () {
            return notificationModel_1.notificationModal.create(notification);
        });
    }
    deleteNotifications(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const deletedNotifications = yield notificationModel_1.notificationModal.deleteMany({ to: userId });
            return deletedNotifications.deletedCount > 0;
        });
    }
    findNotifications(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const notifications = yield notificationModel_1.notificationModal.find({ to: userId }).populate('from', '_id name profileImage');
            return notifications;
        });
    }
    deleteSingleNotification(notificationdId) {
        return __awaiter(this, void 0, void 0, function* () {
            const deleteNotification = yield notificationModel_1.notificationModal.findByIdAndDelete(notificationdId);
            if (!deleteNotification)
                throw new Error('No notification found in this ID');
            return true;
        });
    }
    readNotification(notificationId) {
        return __awaiter(this, void 0, void 0, function* () {
            const readNotification = yield notificationModel_1.notificationModal.findByIdAndUpdate(notificationId, { read: true }, { new: true });
            if (!readNotification)
                throw new Error('No notification found in this ID');
            return true;
        });
    }
}
exports.NotificationRepository = NotificationRepository;
