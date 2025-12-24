import { Server } from "socket.io";
import { Server as httpServer } from "http";
import { IfindChatsBetweenClientAndVendorUseCase } from "../../../domain/interfaces/useCaseInterfaces/chat/IfindChatOfClientAndVendor";
import { IcreateChatUseCase } from "../../../domain/interfaces/useCaseInterfaces/chat/IcreateChatUseCase";
import { chatEntity } from "../../../domain/entities/chat/chatEntity";
import { MessageEntity } from "../../../domain/entities/chat/messageEntity";
import { IcreateMessageUseCase } from "../../../domain/interfaces/useCaseInterfaces/message/IcreateMessageUseCase";
import { IupdateLastMessageOfChatUseCase } from "../../../domain/interfaces/useCaseInterfaces/chat/IupdateLastMessageUseCase";
import { IredisService } from "../../../domain/interfaces/serviceInterface/IredisService";
import { InotificationRepository } from "../../../domain/interfaces/repositoryInterfaces/notification/InotificationRepository";
import { NotificationEntity } from "../../../domain/entities/notificationEntity";
import { IupdateMessagesSeenStatusUseCase } from "../../../domain/interfaces/useCaseInterfaces/message/IupdateMessageSeenStatusUseCase";

export class SocketIoController {
  private io: Server;
  private users: Map<string, { socketId: string; name: string }>;
  private createChatUseCase: IcreateChatUseCase;
  private findChatsBetweenClientAndVendorUseCase: IfindChatsBetweenClientAndVendorUseCase;
  private createMessageUseCase: IcreateMessageUseCase;
  private updateLastMessageUseCase: IupdateLastMessageOfChatUseCase;
  private redisService: IredisService;
  private notificationDatabase: InotificationRepository;
  private updateMessageSeenStatusUseCase: IupdateMessagesSeenStatusUseCase;
  constructor(
    server: httpServer,
    FindChatsBetweenClientAndVendor: IfindChatsBetweenClientAndVendorUseCase,
    createChatUseCase: IcreateChatUseCase,
    createMessageUseCase: IcreateMessageUseCase,
    updateLastMessageUseCase: IupdateLastMessageOfChatUseCase,
    redisService: IredisService,
    notificationDatabase: InotificationRepository,
    updateMessageSeeenStatusUseCase: IupdateMessagesSeenStatusUseCase
  ) {
    this.io = new Server(server, {
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
  private setUpListeners() {
    this.io.on("connect", (socket) => {
      console.log(`socket connected ${socket.id}`);


      socket.on("register", async (data, response) => {
        try {
          console.log("Registration attempt:", {
            userId: data?.userId,
            name: data?.name,
          });

          if (!data || !data.userId || !data.name) {
            throw new Error(
              "Invalid registration data: userId and name are required"
            );
          }

          const userId = String(data.userId);
          const userName = String(data.name);


          const notificationOfTheUser =
            await this.notificationDatabase.findNotifications(userId);

          try {
            await this.redisService.set(
              userId,
              86400,
              JSON.stringify({
                socketId: socket.id,
                name: userName,
              })
            );
            console.log(`User ${userId} stored in Redis successfully`);
          } catch (redisError) {
            console.error("Redis storage error:", redisError);
          }

          this.users.set(userId, { socketId: socket.id, name: userName });

          socket.data.userId = userId;

          

          response(notificationOfTheUser);
        } catch (error) {
          console.error("Registration error:", error);
          response({ error: "Registration failed" });
        }
      });

      socket.on("sendMessage", async (data, response) => {
        if (data.sendMessage.messageContent.trim().length <= 0)
          throw new Error("Empty messages are not allowed");
        let chat =
          await this.findChatsBetweenClientAndVendorUseCase.findChatBetweenClientAndVendor(
            data.sendMessage.senderId,
            data.receiverId
          );
        if (!chat) {
          const chatData: chatEntity = {
            lastMessage: data.sendMessage.messageContent.trim(),
            lastMessageAt: new Date().toString(),
            receiverId: data.receiverId,
            senderId: data.sendMessage.senderId,
            receiverModel: data.receiverModel,
            senderModel: data.sendMessage.senderModel,
          };
          chat = await this.createChatUseCase.createChat(chatData);
        }
        const message: MessageEntity = {
          chatId: chat._id!,
          messageContent: data.sendMessage.messageContent.trim(),
          seen: false,
          sendedTime: new Date(),
          senderId: data.sendMessage.senderId,
          senderModel: data.sendMessage.senderModel,
        };
        const createdMessage = await this.createMessageUseCase.createMessage(
          message
        );
        const updateLastMessage =
          await this.updateLastMessageUseCase.udpateLastMessage(createdMessage);

        response(createdMessage);
        socket.to(data.roomId).emit("receiveMessage", createdMessage);
        const userData = this.users.get(message.senderId.toString());
        const receiverData = this.users.get(data.receiverId);
        const notification: NotificationEntity = {
          from: data.sendMessage.senderId,
          senderModel: data.sendMessage.senderModel,
          message: data.sendMessage.messageContent.trim(),
          to: data.receiverId,
          receiverModel: data.receiverModel,
          read: false,
        };

        const saveNotification =
          await this.notificationDatabase.createNotification(notification);

        if (receiverData) {
          const notification = {
            _id: saveNotification._id,
            from: {
              _id: data.sendMessage.senderId,
              name: userData?.name,
            },
            senderModel: data.sendMessage.senderModel,
            message: data.sendMessage.messageContent.trim(),
            to: data.receiverId,
            receiverModel: data.receiverModel,
            read: false,
          };
          socket.to(receiverData?.socketId).emit("notification", {
            from: userData?.name,
            message: data.sendMessage.messageContent.trim(),
            notification,
          });
        }
      });



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

      socket.on("messagesSeen", async (data) => {
        try {
          const { chatId, roomId, userId, messageIds } = data;

          console.log("📖 Messages seen event received:", {
            chatId,
            userId,
            messageCount: messageIds?.length,
            messageIds,
          });

          if (!chatId || !userId || !messageIds || messageIds.length === 0) {
            console.error("❌ Invalid messagesSeen data");
            return;
          }

          await this.updateMessageSeenStatusUseCase.updateSpecificMessages(
            messageIds,
            chatId
          );

          console.log("✅ Database updated successfully");

          socket.to(roomId).emit("messagesSeenUpdate", {
            chatId,
            seenBy: userId,
            messageIds,
          });

        } catch (error) {
          console.error("❌ Error in messagesSeen handler:", error);
        }
      });

      socket.on("disconnect", async (reason) => {
        console.log(`Socket disconnected ${socket.id}, reason: ${reason}`);

        if (socket.data && socket.data.userId) {
          const userId = socket.data.userId;
          console.log(`Cleaning up user: ${userId}`);

          try {
            this.users.delete(userId);
            console.log(`Removed user ${userId} from users map`);

            await this.redisService.del(userId);
            console.log(`Successfully removed user ${userId} from Redis`);
          } catch (error) {
            console.error(`Error during cleanup for user ${userId}:`, error);
          }
        } else {
          console.log("Socket disconnected without userId - no cleanup needed");
          console.log("Socket data:", socket.data);
        }
      });

      socket.on("joinRoom", (data) => {
        if (!data) throw new Error("No room id available");
        socket.join(data.roomId);
      });
    });
  }
  public getSocket() {
    return this.io;
  }
}
