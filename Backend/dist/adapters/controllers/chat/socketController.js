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
exports.SocketIoController = void 0;
const socket_io_1 = require("socket.io");
class SocketIoController {
    constructor(server, FindChatsBetweenClientAndVendor, createChatUseCase, createMessageUseCase, updateLastMessageUseCase, redisService, notificationDatabase, updateMessageSeeenStatusUseCase) {
        this.io = new socket_io_1.Server(server, {
            cors: {
                origin: process.env.ORGIN,
                credentials: true,
            },
        });
        this.users = new Map();
        this.findChatsBetweenClientAndVendorUseCase =
            FindChatsBetweenClientAndVendor;
        this.createChatUseCase = createChatUseCase;
        this.createMessageUseCase = createMessageUseCase;
        this.redisService = redisService;
        this.updateLastMessageUseCase = updateLastMessageUseCase;
        this.notificationDatabase = notificationDatabase;
        this.updateMessageSeenStatusUseCase = updateMessageSeeenStatusUseCase;
        this.setUpListeners();
    }
    setUpListeners() {
        this.io.on("connect", (socket) => {
            console.log(`socket connected ${socket.id}`);
            socket.on("register", (data, response) => __awaiter(this, void 0, void 0, function* () {
                try {
                    console.log("Registration attempt:", {
                        userId: data === null || data === void 0 ? void 0 : data.userId,
                        name: data === null || data === void 0 ? void 0 : data.name,
                    });
                    if (!data || !data.userId || !data.name) {
                        throw new Error("Invalid registration data: userId and name are required");
                    }
                    const userId = String(data.userId);
                    const userName = String(data.name);
                    const notificationOfTheUser = yield this.notificationDatabase.findNotifications(userId);
                    try {
                        yield this.redisService.set(userId, 86400, JSON.stringify({
                            socketId: socket.id,
                            name: userName,
                        }));
                        console.log(`User ${userId} stored in Redis successfully`);
                    }
                    catch (redisError) {
                        console.error("Redis storage error:", redisError);
                    }
                    this.users.set(userId, { socketId: socket.id, name: userName });
                    socket.data.userId = userId;
                    response(notificationOfTheUser);
                }
                catch (error) {
                    console.error("Registration error:", error);
                    response({ error: "Registration failed" });
                }
            }));
            socket.on("sendMessage", (data, response) => __awaiter(this, void 0, void 0, function* () {
                if (data.sendMessage.messageContent.trim().length <= 0)
                    throw new Error("Empty messages are not allowed");
                let chat = yield this.findChatsBetweenClientAndVendorUseCase.findChatBetweenClientAndVendor(data.sendMessage.senderId, data.receiverId);
                if (!chat) {
                    const chatData = {
                        lastMessage: data.sendMessage.messageContent.trim(),
                        lastMessageAt: new Date().toString(),
                        receiverId: data.receiverId,
                        senderId: data.sendMessage.senderId,
                        receiverModel: data.receiverModel,
                        senderModel: data.sendMessage.senderModel,
                    };
                    chat = yield this.createChatUseCase.createChat(chatData);
                }
                const message = {
                    chatId: chat._id,
                    messageContent: data.sendMessage.messageContent.trim(),
                    seen: false,
                    sendedTime: new Date(),
                    senderId: data.sendMessage.senderId,
                    senderModel: data.sendMessage.senderModel,
                };
                const createdMessage = yield this.createMessageUseCase.createMessage(message);
                const updateLastMessage = yield this.updateLastMessageUseCase.udpateLastMessage(createdMessage);
                response(createdMessage);
                socket.to(data.roomId).emit("receiveMessage", createdMessage);
                const userData = this.users.get(message.senderId.toString());
                const receiverData = this.users.get(data.receiverId);
                const notification = {
                    from: data.sendMessage.senderId,
                    senderModel: data.sendMessage.senderModel,
                    message: data.sendMessage.messageContent.trim(),
                    to: data.receiverId,
                    receiverModel: data.receiverModel,
                    read: false,
                };
                const saveNotification = yield this.notificationDatabase.createNotification(notification);
                if (receiverData) {
                    const notification = {
                        _id: saveNotification._id,
                        from: {
                            _id: data.sendMessage.senderId,
                            name: userData === null || userData === void 0 ? void 0 : userData.name,
                        },
                        senderModel: data.sendMessage.senderModel,
                        message: data.sendMessage.messageContent.trim(),
                        to: data.receiverId,
                        receiverModel: data.receiverModel,
                        read: false,
                    };
                    socket.to(receiverData === null || receiverData === void 0 ? void 0 : receiverData.socketId).emit("notification", {
                        from: userData === null || userData === void 0 ? void 0 : userData.name,
                        message: data.sendMessage.messageContent.trim(),
                        notification,
                    });
                }
            }));
            socket.on("typing", (data) => {
                socket.to(data.roomId).emit("typing", {
                    username: data.username,
                    roomId: data.roomId,
                });
            });
            socket.on("stopped-typing", (data) => {
                socket.to(data.roomId).emit("stopped-typing", {
                    roomId: data.roomId,
                });
            });
            socket.on("messagesSeen", (data) => __awaiter(this, void 0, void 0, function* () {
                try {
                    const { chatId, roomId, userId, messageIds } = data;
                    console.log("📖 Messages seen event received:", {
                        chatId,
                        userId,
                        messageCount: messageIds === null || messageIds === void 0 ? void 0 : messageIds.length,
                        messageIds,
                    });
                    if (!chatId || !userId || !messageIds || messageIds.length === 0) {
                        console.error("❌ Invalid messagesSeen data");
                        return;
                    }
                    yield this.updateMessageSeenStatusUseCase.updateSpecificMessages(messageIds, chatId);
                    console.log("✅ Database updated successfully");
                    socket.to(roomId).emit("messagesSeenUpdate", {
                        chatId,
                        seenBy: userId,
                        messageIds,
                    });
                }
                catch (error) {
                    console.error("❌ Error in messagesSeen handler:", error);
                }
            }));
            socket.on("disconnect", (reason) => __awaiter(this, void 0, void 0, function* () {
                console.log(`Socket disconnected ${socket.id}, reason: ${reason}`);
                if (socket.data && socket.data.userId) {
                    const userId = socket.data.userId;
                    console.log(`Cleaning up user: ${userId}`);
                    try {
                        this.users.delete(userId);
                        console.log(`Removed user ${userId} from users map`);
                        yield this.redisService.del(userId);
                        console.log(`Successfully removed user ${userId} from Redis`);
                    }
                    catch (error) {
                        console.error(`Error during cleanup for user ${userId}:`, error);
                    }
                }
                else {
                    console.log("Socket disconnected without userId - no cleanup needed");
                    console.log("Socket data:", socket.data);
                }
            }));
            socket.on("joinRoom", (data) => {
                if (!data)
                    throw new Error("No room id available");
                socket.join(data.roomId);
            });
        });
    }
    getSocket() {
        return this.io;
    }
}
exports.SocketIoController = SocketIoController;
