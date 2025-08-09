import { ObjectId, Types } from "mongoose";
import { TransactionsEntity } from "../../../domain/entities/wallet/transactionEntity";
import { ItransactionRepository } from "../../../domain/interfaces/repositoryInterfaces/transaction/ItransactionRepository";
import { transactionModel } from "../../../framework/database/models/transactionModel";

export class TransactionRepository implements ItransactionRepository {
    async createTransaction(transaction: TransactionsEntity): Promise<TransactionsEntity> {
        return await transactionModel.create(transaction)
    }
    async findTransactionsOfAWallet(walletId: string | ObjectId, pageNo: number): Promise<{ transactions: TransactionsEntity[] | [], totalPages: number }> {
        const page = Math.max(pageNo, 1)
        console.log(walletId)
        const limit = 5
        const skip = (page - 1) * limit
        const formattedWalletId = typeof walletId === 'string' ? new Types.ObjectId(walletId) : walletId;
        const transactions = await transactionModel.find({ walletId }).select('-__v -createdAt -updatedAt').sort({ createdAt: -1 }).skip(skip).limit(limit)
        const totalPages = Math.ceil(await transactionModel.countDocuments({ walletId: formattedWalletId }) / limit) || 1
        return { transactions, totalPages }
    }
    
}