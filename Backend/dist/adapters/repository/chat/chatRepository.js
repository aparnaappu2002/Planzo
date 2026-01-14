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
exports.ChatRepository = void 0;
const chatModel_1 = require("../../../framework/database/models/chatModel");
class ChatRepository {
    createChat(chat) {
        return __awaiter(this, void 0, void 0, function* () {
            return chatModel_1.chatModel.create(chat);
        });
    }
    getchatsOfUser(userId, pageNo) {
        return __awaiter(this, void 0, void 0, function* () {
            const limit = 10;
            const page = Math.max(pageNo, 1);
            const skip = (page - 1) * limit;
            const chatsResult = yield chatModel_1.chatModel.find({
                $or: [
                    { senderId: userId },
                    { receiverId: userId }
                ]
            }).sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate('senderId', 'name profileImage')
                .populate('receiverId', 'name profileImage');
            const totalChats = yield chatModel_1.chatModel.countDocuments({
                $or: [
                    { senderId: userId },
                    { receiverId: userId }
                ]
            });
            const hasMore = (skip + chatsResult.length) < totalChats;
            const chats = chatsResult.map(chat => ({
                _id: chat._id.toString(),
                lastMessage: chat.lastMessage,
                lastMessageAt: chat.lastMessageAt,
                senderId: {
                    _id: chat.senderId._id.toString(),
                    name: chat.senderId.name,
                    profileImage: chat.senderId.profileImage
                },
                receiverId: {
                    _id: chat.receiverId._id.toString(),
                    name: chat.receiverId.name,
                    profileImage: chat.receiverId.profileImage
                },
                senderModel: chat.senderModel,
                receiverModel: chat.receiverModel
            }));
            return { chats, hasMore };
        });
    }
    getChatsOfParticularUsers(senderId, receiverId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield chatModel_1.chatModel.findOne({
                $or: [
                    { senderId: senderId, receiverId: receiverId },
                    { senderId: receiverId, receiverId: senderId }
                ]
            });
        });
    }
    updateLastMessage(message) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield chatModel_1.chatModel.findByIdAndUpdate(message.chatId, { lastMessage: message.messageContent, lastMessageAt: message.sendedTime }, { new: true });
        });
    }
    getChatId(senderId, receiverId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield chatModel_1.chatModel.findOne({
                $or: [
                    { senderId: senderId, receiverId: receiverId },
                    { senderId: receiverId, receiverId: senderId }
                ]
            }).select('_id chatId');
        });
    }
}
exports.ChatRepository = ChatRepository;
