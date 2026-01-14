"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectMongo = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
class connectMongo {
    constructor() {
        if (!process.env.MONGODB) {
            throw new Error('mongodb url is not available');
        }
        else {
            this.databaseUrl = process.env.MONGODB;
        }
    }
    connectDb() {
        mongoose_1.default.connect(this.databaseUrl).then(() => console.log("db connected")).catch((err) => console.log(err));
    }
}
exports.connectMongo = connectMongo;
