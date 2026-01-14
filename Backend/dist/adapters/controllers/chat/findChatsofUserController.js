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
exports.FindChatOfUserController = void 0;
const httpStatus_1 = require("../../../domain/enums/httpStatus");
const messages_1 = require("../../../domain/enums/messages");
class FindChatOfUserController {
    constructor(findChatOfUserUseCase) {
        this.findChatOfUserUseCase = findChatOfUserUseCase;
    }
    handleFindChatOfUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const pageNo = req.query.pageNo;
                const userId = req.query.userId;
                const page = parseInt(pageNo, 10) || 1;
                const { chats, hasMore } = yield this.findChatOfUserUseCase.findChatsOfUser(userId, page);
                res.status(httpStatus_1.HttpStatus.OK).json({ message: messages_1.Messages.CHAT_FETCHED, chats, hasMore });
            }
            catch (error) {
                console.log('error while finding the chats of user', error);
                res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({
                    message: messages_1.Messages.CHAT_FETCH_ERROR,
                    error: error instanceof Error ? error.message : messages_1.Messages.CHAT_FETCH_ERROR
                });
            }
        });
    }
}
exports.FindChatOfUserController = FindChatOfUserController;
