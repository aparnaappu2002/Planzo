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

export class SocketIoController {
  private io: Server;
  private users: Map<string, { socketId: string; name: string }>;
  private createChatUseCase: IcreateChatUseCase;
  private findChatsBetweenClientAndVendorUseCase: IfindChatsBetweenClientAndVendorUseCase;
  private createMessageUseCase: IcreateMessageUseCase;
  private updateLastMessageUseCase: IupdateLastMessageOfChatUseCase;
  private redisService: IredisService;
  private notificationDatabase: InotificationRepository;
  constructor(
    server: httpServer,
    FindChatsBetweenClientAndVendor: IfindChatsBetweenClientAndVendorUseCase,
    createChatUseCase: IcreateChatUseCase,
    createMessageUseCase: IcreateMessageUseCase,
    updateLastMessageUseCase: IupdateLastMessageOfChatUseCase,
    redisService: IredisService,
    notificationDatabase: InotificationRepository
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
    this.setUpListeners();
  }
  private setUpListeners() {
    this.io.on("connect", (socket) => {
      console.log(`socket connected ${socket.id}`);

      // Replace your register handler in the backend with this:

      socket.on("register", async (data, response) => {
        try {
          console.log("Registration attempt:", {
            userId: data?.userId,
            name: data?.name,
          });

          // Validate input data
          if (!data || !data.userId || !data.name) {
            throw new Error(
              "Invalid registration data: userId and name are required"
            );
          }

          // Ensure userId is a string
          const userId = String(data.userId);
          const userName = String(data.name);

          console.log(`Registering user: ${userId} with name: ${userName}`);

          // Get notifications for the user
          const notificationOfTheUser =
            await this.notificationDatabase.findNotifications(userId);

          // Store user data in Redis
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
            // Continue with registration even if Redis fails
          }

          // Store in in-memory map
          this.users.set(userId, { socketId: socket.id, name: userName });

          // Store userId in socket data for cleanup
          socket.data.userId = userId;

          console.log(
            `User ${userId} registered successfully with socket ${socket.id}`
          );

          // Send response back to client
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
          socket
            .to(receiverData?.socketId)
            .emit("notification", {
              from: userData?.name,
              message: data.sendMessage.messageContent.trim(),
              notification,
            });
        }
      });

      // Replace your disconnect handler in the backend with this:

      socket.on('typing', (data) => {
    // Broadcast to all clients except the sender
    socket.broadcast.emit('display', data);
  });

  // Listen for 'stop_typing' event
  socket.on('stop_typing', (data) => {
    socket.broadcast.emit('display', data);
  });

      socket.on("disconnect", async (reason) => {
        console.log(`Socket disconnected ${socket.id}, reason: ${reason}`);

        // Check if userId exists before attempting cleanup
        if (socket.data && socket.data.userId) {
          const userId = socket.data.userId;
          console.log(`Cleaning up user: ${userId}`);

          try {
            // Remove from in-memory users map
            this.users.delete(userId);
            console.log(`Removed user ${userId} from users map`);

            // Remove from Redis with proper error handling
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
