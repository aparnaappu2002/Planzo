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
exports.WalletRepository = void 0;
const walletModel_1 = require("../../../framework/database/models/walletModel");
class WalletRepository {
    createWallet(wallet) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield walletModel_1.walletModel.create(wallet);
        });
    }
    findWalletByUserId(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield walletModel_1.walletModel.findOne({ userId });
        });
    }
    addMoney(userId, amount) {
        return __awaiter(this, void 0, void 0, function* () {
            return walletModel_1.walletModel.findOneAndUpdate({ userId }, { $inc: { balance: amount } }, { new: true });
        });
    }
    reduceMoney(userId, amount) {
        return __awaiter(this, void 0, void 0, function* () {
            return walletModel_1.walletModel.findOneAndUpdate({ userId }, { $inc: { balance: -amount } }, { new: true });
        });
    }
    findTotalAmount(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const wallet = yield walletModel_1.walletModel.findOne({ userId: userId }).select('balance').lean();
            return (_a = wallet === null || wallet === void 0 ? void 0 : wallet.balance) !== null && _a !== void 0 ? _a : null;
        });
    }
    findWalletId(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const wallet = yield walletModel_1.walletModel.findOne({ userId }).select('_id').lean();
            return (_a = wallet === null || wallet === void 0 ? void 0 : wallet._id.toString()) !== null && _a !== void 0 ? _a : null;
        });
    }
    payWithWallet(userId, amount) {
        return __awaiter(this, void 0, void 0, function* () {
            const wallet = yield walletModel_1.walletModel.findOneAndUpdate({ userId }, { $inc: { balance: -amount } });
            if (!wallet)
                return false;
            return true;
        });
    }
    findWalletById(walletId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield walletModel_1.walletModel.findById(walletId);
        });
    }
}
exports.WalletRepository = WalletRepository;
