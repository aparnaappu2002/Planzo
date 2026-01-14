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
exports.CreateChatUseCase = void 0;
class CreateChatUseCase {
    constructor(chatDatabase) {
        this.chatDatabase = chatDatabase;
    }
    createChat(chat) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingChat = yield this.chatDatabase.getChatsOfParticularUsers(chat.senderId, chat.receiverId);
            if (existingChat)
                return existingChat;
            const createdChat = yield this.chatDatabase.createChat(chat);
            if (!createdChat)
                throw new Error('Error while creating new chat');
            return createdChat;
        });
    }
}
exports.CreateChatUseCase = CreateChatUseCase;
