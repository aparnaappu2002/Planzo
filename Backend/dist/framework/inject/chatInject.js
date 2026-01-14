"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.injectedNotificationController = exports.injectedFindChatsOfUserController = exports.injectedLoadPreviousChatController = exports.injectedUpdateLastMessageUseCase = exports.injectedFindMessagesOfChatUseCase = exports.injectedCreateMessageUseCase = exports.injectedFindChatBetweenClientAndVendorUseCase = exports.injectedCreateChatUseCase = void 0;
const findChatsofUserController_1 = require("../../adapters/controllers/chat/findChatsofUserController");
const loadPreviousMessageController_1 = require("../../adapters/controllers/message/loadPreviousMessageController");
const notificationController_1 = require("../../adapters/controllers/notification/notificationController");
const chatRepository_1 = require("../../adapters/repository/chat/chatRepository");
const messageRepository_1 = require("../../adapters/repository/message/messageRepository");
const notificationRepository_1 = require("../../adapters/repository/notification/notificationRepository");
const createChatUseCase_1 = require("../../useCases/chat/createChatUseCase");
const findChatsOfClientAndVendor_1 = require("../../useCases/chat/findChatsOfClientAndVendor");
const findChatsofUserUseCase_1 = require("../../useCases/chat/findChatsofUserUseCase");
const updateLastMessageUseCase_1 = require("../../useCases/chat/updateLastMessageUseCase");
const createMessageUseCase_1 = require("../../useCases/message/createMessageUseCase");
const getMessageOfChatUseCase_1 = require("../../useCases/message/getMessageOfChatUseCase");
const loadPreviousChatUseCase_1 = require("../../useCases/message/loadPreviousChatUseCase");
const deleteAllNotificationUseCase_1 = require("../../useCases/notification/deleteAllNotificationUseCase");
const deleteSingleNotificationUseCase_1 = require("../../useCases/notification/deleteSingleNotificationUseCase");
const readNotificationUseCase_1 = require("../../useCases/notification/readNotificationUseCase");
//chat creation
const chatRepository = new chatRepository_1.ChatRepository();
exports.injectedCreateChatUseCase = new createChatUseCase_1.CreateChatUseCase(chatRepository);
//find chats between client and vendor
exports.injectedFindChatBetweenClientAndVendorUseCase = new findChatsOfClientAndVendor_1.FindChatBetweenClientAndVendorUseCase(chatRepository);
//create message
const messageDatabase = new messageRepository_1.MessageRepository();
exports.injectedCreateMessageUseCase = new createMessageUseCase_1.CreateMessageUseCase(messageDatabase);
//find message
exports.injectedFindMessagesOfChatUseCase = new getMessageOfChatUseCase_1.GetMessagesOfAChatUseCase(messageDatabase);
//update last message
exports.injectedUpdateLastMessageUseCase = new updateLastMessageUseCase_1.UpdateLastMessageUseCase(chatRepository);
//load previous chat
const loadPreviousChatUseCase = new loadPreviousChatUseCase_1.LoadPreviousChatUseCase(messageDatabase);
exports.injectedLoadPreviousChatController = new loadPreviousMessageController_1.LoadPreviousMessageController(loadPreviousChatUseCase);
//--------------------------------------Find chats of a user---------------------------------
const findChatsOfUserUseCase = new findChatsofUserUseCase_1.FindChatsOfAUserUseCase(chatRepository);
exports.injectedFindChatsOfUserController = new findChatsofUserController_1.FindChatOfUserController(findChatsOfUserUseCase);
//notification
const notificationRepository = new notificationRepository_1.NotificationRepository();
const readNotificationUseCase = new readNotificationUseCase_1.ReadNotificationUseCase(notificationRepository);
const deleteSingleNotificationUseCase = new deleteSingleNotificationUseCase_1.DeleteSingleNotificationUseCase(notificationRepository);
const deleteAllNotificationUseCase = new deleteAllNotificationUseCase_1.DeleteAllNotificationsUseCase(notificationRepository);
exports.injectedNotificationController = new notificationController_1.NotificationController(readNotificationUseCase, deleteSingleNotificationUseCase, deleteAllNotificationUseCase);
