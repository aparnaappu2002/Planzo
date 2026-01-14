"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.App = void 0;
const express_1 = __importStar(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const morgan_1 = __importDefault(require("morgan"));
const dbConnection_1 = require("./framework/database/databaseConnection/dbConnection");
const redisService_1 = __importDefault(require("./framework/services/redisService"));
const clientRoute_1 = require("./framework/routes/client/clientRoute");
const vendorRoute_1 = require("./framework/routes/vendor/vendorRoute");
const adminRoute_1 = require("./framework/routes/admin/adminRoute");
const authRoute_1 = require("./framework/routes/auth/authRoute");
const socketController_1 = require("./adapters/controllers/chat/socketController");
const http_1 = __importDefault(require("http"));
const chatInject_1 = require("./framework/inject/chatInject");
const notificationRepository_1 = require("./adapters/repository/notification/notificationRepository");
const error_middleware_1 = require("./adapters/middlewares/errorHandlingMiddleware/error.middleware");
const updateMessageSeenStatusUseCase_1 = require("./useCases/message/updateMessageSeenStatusUseCase");
const messageRepository_1 = require("./adapters/repository/message/messageRepository");
class App {
    constructor() {
        dotenv_1.default.config();
        this.app = (0, express_1.default)();
        this.database = new dbConnection_1.connectMongo();
        this.server = http_1.default.createServer(this.app);
        this.database.connectDb();
        this.setMiddlewares();
        this.setClientRoute();
        this.setVendorRoute();
        this.setAdminRoute();
        this.setAuthRoute();
        this.connectRedis();
        this.setSocketIo();
        this.setErrorHandler();
    }
    setMiddlewares() {
        this.app.use((0, cors_1.default)({
            origin: process.env.ORGIN,
            credentials: true,
        }));
        this.app.use((0, cookie_parser_1.default)());
        this.app.use(express_1.default.json());
        this.app.use((0, express_1.urlencoded)({ extended: true }));
        this.app.use((0, morgan_1.default)("dev"));
    }
    connectRedis() {
        return __awaiter(this, void 0, void 0, function* () {
            yield redisService_1.default.connect();
        });
    }
    setClientRoute() {
        this.app.use("/user", new clientRoute_1.clientRoute().clientRoute);
    }
    setVendorRoute() {
        this.app.use("/vendor", new vendorRoute_1.VendorRoute().vendorRoute);
    }
    setAdminRoute() {
        this.app.use("/admin", new adminRoute_1.AdminRoute().adminRoute);
    }
    setAuthRoute() {
        this.app.use("/auth", new authRoute_1.AuthRoute().AuthRouter);
    }
    setSocketIo() {
        const messageRepository = new messageRepository_1.MessageRepository();
        const updateMessagesSeenStatusUseCase = new updateMessageSeenStatusUseCase_1.UpdateMessagesSeenStatusUseCase(messageRepository);
        this.socketIoServer = new socketController_1.SocketIoController(this.server, chatInject_1.injectedFindChatBetweenClientAndVendorUseCase, chatInject_1.injectedCreateChatUseCase, chatInject_1.injectedCreateMessageUseCase, chatInject_1.injectedUpdateLastMessageUseCase, redisService_1.default, new notificationRepository_1.NotificationRepository(), updateMessagesSeenStatusUseCase);
    }
    setErrorHandler() {
        this.app.use(error_middleware_1.errorHandler);
    }
    listen() {
        const port = process.env.PORT;
        this.server.listen(port, () => console.log(`server running on ${port}`));
    }
}
exports.App = App;
