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
exports.MessageRepository = void 0;
const messageModel_1 = require("../../../framework/database/models/messageModel");
class MessageRepository {
    createMessage(message) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield messageModel_1.messageModel.create(message);
        });
    }
    getMessages(senderId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield messageModel_1.messageModel.find({ senderId }).select('-__v -createdAt -updatedAt');
        });
    }
    getMessagesOfAChat(chatId, pageNo) {
        return __awaiter(this, void 0, void 0, function* () {
            const page = Math.max(pageNo, 1);
            const limit = 10;
            const skip = (page - 1) * limit;
            const messages = yield messageModel_1.messageModel.find({ chatId }).select('-__v -createdAt -updatedAt').sort({ sendedTime: -1 }).skip(skip).limit(limit);
            const totalMessages = yield messageModel_1.messageModel.countDocuments({ chatId });
            const hasMore = (skip + messages.length) < totalMessages;
            return { messages, hasMore };
        });
    }
    updateMessagesSeenStatus(messageIds, chatId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield messageModel_1.messageModel.updateMany({
                _id: { $in: messageIds },
                chatId: chatId,
                seen: false
            }, {
                $set: { seen: true }
            });
        });
    }
}
exports.MessageRepository = MessageRepository;
