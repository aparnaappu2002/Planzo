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
exports.UpdateMessagesSeenStatusUseCase = void 0;
class UpdateMessagesSeenStatusUseCase {
    constructor(messageRepository) {
        this.messageRepository = messageRepository;
    }
    updateSpecificMessages(messageIds, chatId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!messageIds || messageIds.length === 0) {
                throw new Error("Message IDs are required");
            }
            if (!chatId) {
                throw new Error("Chat ID is required");
            }
            yield this.messageRepository.updateMessagesSeenStatus(messageIds, chatId);
        });
    }
}
exports.UpdateMessagesSeenStatusUseCase = UpdateMessagesSeenStatusUseCase;
