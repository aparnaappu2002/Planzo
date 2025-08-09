import { ObjectId } from "mongoose";
import { WalletEntity } from "../../../domain/entities/wallet/walletEntity";
import { IwalletRepository } from "../../../domain/interfaces/repositoryInterfaces/wallet/IwalletRepository";
import { walletModel } from "../../../framework/database/models/walletModel";

export class WalletRepository implements IwalletRepository {
    async createWallet(wallet: WalletEntity): Promise<WalletEntity> {
        return await walletModel.create(wallet)
    }
    async findWalletByUserId(userId: string | ObjectId): Promise<WalletEntity | null> {
        return await walletModel.findOne({ userId })
    }
    async addMoney(userId: string | ObjectId, amount: number): Promise<WalletEntity | null> {
        return walletModel.findOneAndUpdate({ userId }, { $inc: { balance: amount } }, { new: true })
    }
    async reduceMoney(userId: string | ObjectId, amount: number): Promise<WalletEntity | null> {
        return walletModel.findOneAndUpdate({ userId }, { $inc: { balance: -amount } }, { new: true })
    }
    async findTotalAmount(userId: string): Promise<number | null> {
        const wallet = await walletModel.findOne({ userId: userId }).select('balance').lean()
        return wallet?.balance ?? null;
    }
    async findWalletId(userId: string): Promise<string | null> {
        const wallet = await walletModel.findOne({ userId }).select('_id').lean()
        return wallet?._id.toString() ?? null
    }
    async payWithWallet(userId: string, amount: number): Promise<boolean> {
        const wallet = await walletModel.findOneAndUpdate({ userId }, { $inc: { balance: -amount } })
        if (!wallet) return false
        return true
    }
    async findWalletById(walletId: string): Promise<WalletEntity | null> {
        return await walletModel.findById(walletId)
    }
}