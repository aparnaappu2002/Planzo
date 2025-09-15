import { FindChatOfUserController } from "../../adapters/controllers/chat/findChatsofUserController";
import { LoadPreviousMessageController } from "../../adapters/controllers/message/loadPreviousMessageController";
import { NotificationController } from "../../adapters/controllers/notification/notificationController";
import { ChatRepository } from "../../adapters/repository/chat/chatRepository";
import { MessageRepository } from "../../adapters/repository/message/messageRepository";
import { NotificationRepository } from "../../adapters/repository/notification/notificationRepository";
import { CreateChatUseCase } from "../../useCases/chat/createChatUseCase";
import { FindChatBetweenClientAndVendorUseCase } from "../../useCases/chat/findChatsOfClientAndVendor";
import { FindChatsOfAUserUseCase } from "../../useCases/chat/findChatsofUserUseCase";
import { UpdateLastMessageUseCase } from "../../useCases/chat/updateLastMessageUseCase";
import { CreateMessageUseCase } from "../../useCases/message/createMessageUseCase";
import { GetMessagesOfAChatUseCase } from "../../useCases/message/getMessageOfChatUseCase";
import { LoadPreviousChatUseCase } from "../../useCases/message/loadPreviousChatUseCase";
import { DeleteAllNotificationsUseCase } from "../../useCases/notification/deleteAllNotificationUseCase";
import { DeleteSingleNotificationUseCase } from "../../useCases/notification/deleteSingleNotificationUseCase";
import { ReadNotificationUseCase } from "../../useCases/notification/readNotificationUseCase";

//chat creation
const chatRepository = new ChatRepository()
export const injectedCreateChatUseCase = new CreateChatUseCase(chatRepository)

//find chats between client and vendor
export const injectedFindChatBetweenClientAndVendorUseCase = new FindChatBetweenClientAndVendorUseCase(chatRepository)



//create message
const messageDatabase = new MessageRepository()
export const injectedCreateMessageUseCase = new CreateMessageUseCase(messageDatabase)




//find message
export const injectedFindMessagesOfChatUseCase = new GetMessagesOfAChatUseCase(messageDatabase)

//update last message
export const injectedUpdateLastMessageUseCase = new UpdateLastMessageUseCase(chatRepository)

//load previous chat
const loadPreviousChatUseCase = new LoadPreviousChatUseCase(messageDatabase)
export const injectedLoadPreviousChatController = new LoadPreviousMessageController(loadPreviousChatUseCase)

//--------------------------------------Find chats of a user---------------------------------
const findChatsOfUserUseCase = new FindChatsOfAUserUseCase(chatRepository)
export const injectedFindChatsOfUserController = new FindChatOfUserController(findChatsOfUserUseCase)

//notification
const notificationRepository=new NotificationRepository()
const readNotificationUseCase=new ReadNotificationUseCase(notificationRepository)
const deleteSingleNotificationUseCase=new DeleteSingleNotificationUseCase(notificationRepository)
const deleteAllNotificationUseCase=new DeleteAllNotificationsUseCase(notificationRepository)
export const injectedNotificationController=new NotificationController(readNotificationUseCase,deleteSingleNotificationUseCase,deleteAllNotificationUseCase)