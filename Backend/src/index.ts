import express, { Express, urlencoded } from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { connectMongo } from "./framework/database/databaseConnection/dbConnection";
import redisService from "./framework/services/redisService";
import { clientRoute } from "./framework/routes/client/clientRoute";
import { VendorRoute } from "./framework/routes/vendor/vendorRoute";
import { AdminRoute } from "./framework/routes/admin/adminRoute";
import { AuthRoute } from "./framework/routes/auth/authRoute";
import { SocketIoController } from "./adapters/controllers/chat/socketController";
import http from 'http'
import { injectedCreateChatUseCase, injectedCreateMessageUseCase, injectedFindChatBetweenClientAndVendorUseCase, injectedUpdateLastMessageUseCase } from "./framework/inject/chatInject";
import { NotificationRepository } from "./adapters/repository/notification/notificationRepository";

export class App {
  private app: Express;
  private database: connectMongo;
  private server: http.Server
  private socketIoServer?: SocketIoController
  constructor() {
    dotenv.config();
    this.app = express();
    this.database = new connectMongo();
    this.server = http.createServer(this.app)
    this.database.connectDb();
    this.setMiddlewares();
    this.setClientRoute();
    this.setVendorRoute();
    this.setAdminRoute()
    this.setAuthRoute()
    this.connectRedis()
    this.setSocketIo()
  }
  private setMiddlewares() {
    this.app.use(
      cors({
        origin: process.env.ORGIN,
        credentials: true,
      })
    );
    this.app.use(cookieParser());
    this.app.use(express.json());
    this.app.use(urlencoded({ extended: true }));
    this.app.use(morgan("dev"));
  }
  private async connectRedis(){
    await redisService.connect()
  }
  private setClientRoute() {
    this.app.use("/user", new clientRoute().clientRoute);
  }
  private setVendorRoute() {
    this.app.use("/vendor", new VendorRoute().vendorRoute);
  }
  private setAdminRoute(){
    this.app.use('/admin',new AdminRoute().adminRoute)
  }
  private setAuthRoute() {
    this.app.use('/auth', new AuthRoute().AuthRouter)
  }
  private setSocketIo() {
        this.socketIoServer = new SocketIoController(this.server, injectedFindChatBetweenClientAndVendorUseCase, injectedCreateChatUseCase, injectedCreateMessageUseCase, injectedUpdateLastMessageUseCase, redisService, new NotificationRepository())
    }
  public listen() {
    const port = process.env.PORT;
    this.server.listen(port, () => console.log(`server running on ${port}`));
  }
}
