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

export class App {
  private app: Express;
  private database: connectMongo;
  constructor() {
    dotenv.config();
    this.app = express();
    this.database = new connectMongo();
    this.database.connectDb();
    this.setMiddlewares();
    this.setClientRoute();
    this.setVendorRoute();
    this.setAdminRoute()
    this.setAuthRoute()
    this.connectRedis()

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
  public listen() {
    const port = process.env.PORT;
    this.app.listen(port, () => console.log(`server running on ${port}`));
  }
}
