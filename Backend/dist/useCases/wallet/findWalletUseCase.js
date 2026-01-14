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
exports.FindWalletUseCase = void 0;
class FindWalletUseCase {
    constructor(walletDatabase) {
        this.walletDatabase = walletDatabase;
    }
    findWallet(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const wallet = yield this.walletDatabase.findWalletByUserId(userId);
            if (!wallet)
                throw new Error("No wallet found in this userId");
            return wallet;
        });
    }
}
exports.FindWalletUseCase = FindWalletUseCase;
