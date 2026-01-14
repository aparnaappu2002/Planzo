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
exports.TransactionRepository = void 0;
const mongoose_1 = require("mongoose");
const transactionModel_1 = require("../../../framework/database/models/transactionModel");
class TransactionRepository {
    createTransaction(transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield transactionModel_1.transactionModel.create(transaction);
        });
    }
    findTransactionsOfAWallet(walletId, pageNo) {
        return __awaiter(this, void 0, void 0, function* () {
            const page = Math.max(pageNo, 1);
            console.log(walletId);
            const limit = 10;
            const skip = (page - 1) * limit;
            const formattedWalletId = typeof walletId === "string" ? new mongoose_1.Types.ObjectId(walletId) : walletId;
            const transactions = yield transactionModel_1.transactionModel
                .find({ walletId })
                .select("-__v -createdAt -updatedAt")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit);
            const totalPages = Math.ceil((yield transactionModel_1.transactionModel.countDocuments({
                walletId: formattedWalletId,
            })) / limit) || 1;
            return { transactions, totalPages };
        });
    }
    findTransactionsByPaymentStatus(paymentStatus_1, pageNo_1) {
        return __awaiter(this, arguments, void 0, function* (paymentStatus, pageNo, sortBy = "newest") {
            const sortOptions = {
                "amount-high-low": { amount: -1 },
                "amount-low-high": { amount: 1 },
                newest: { date: -1 },
                oldest: { date: 1 },
            };
            const sort = sortOptions[sortBy] || { date: -1 };
            const limit = 10;
            const page = Math.max(pageNo, 1);
            const skip = (page - 1) * limit;
            // Normalize input
            const status = paymentStatus.toLowerCase().trim();
            if (!["credit", "debit"].includes(status)) {
                return { transactions: [], totalPages: 0 };
            }
            const query = { paymentStatus: status }; // exact match
            const [transactions, totalCount] = yield Promise.all([
                transactionModel_1.transactionModel
                    .find(query)
                    .select("-__v -updatedAt")
                    .sort(sort)
                    .skip(skip)
                    .limit(limit)
                    .lean(),
                transactionModel_1.transactionModel.countDocuments(query),
            ]);
            return {
                transactions: transactions || [],
                totalPages: Math.ceil(totalCount / limit) || 1,
                total: totalCount,
            };
        });
    }
}
exports.TransactionRepository = TransactionRepository;
