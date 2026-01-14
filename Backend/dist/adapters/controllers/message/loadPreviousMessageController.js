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
exports.LoadPreviousMessageController = void 0;
const httpStatus_1 = require("../../../domain/enums/httpStatus");
class LoadPreviousMessageController {
    constructor(loadPreviousMessageUseCase) {
        this.loadPreviousMessageUseCase = loadPreviousMessageUseCase;
    }
    handleLoadPreviousMessage(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const pageNo = req.query.pageNo;
                const chatId = req.query.chatId;
                if (!pageNo || !chatId) {
                    res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({ error: "pageNo or chatId is not provided" });
                    return;
                }
                const page = parseInt(pageNo, 10) || 1;
                const { messages, hasMore } = yield this.loadPreviousMessageUseCase.loadPreviousChat(chatId, page);
                res.status(httpStatus_1.HttpStatus.OK).json({ message: "Previous chat loaded", messages, hasMore });
            }
            catch (error) {
                console.log('error while loading previous message of chat', error);
                res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({
                    message: "error while loading previous message of chat",
                    error: error instanceof Error ? error.message : 'error while loading previous message of chat'
                });
            }
        });
    }
}
exports.LoadPreviousMessageController = LoadPreviousMessageController;
