import { WalletEntity } from "../../domain/entities/wallet/walletEntity";
import { IwalletRepository } from "../../domain/interfaces/repositoryInterfaces/wallet/IwalletRepository";
import { IfindWalletUseCase } from "../../domain/interfaces/repositoryInterfaces/wallet/IfindWalletUseCase";

export class FindWalletUseCase implements IfindWalletUseCase {
    private walletDatabase: IwalletRepository
    constructor(walletDatabase: IwalletRepository) {
        this.walletDatabase = walletDatabase
    }
    async findWallet(userId: string): Promise<WalletEntity | null> {
        const wallet = await this.walletDatabase.findWalletByUserId(userId)
        if (!wallet) throw new Error("No wallet found in this userId")
        return wallet
    }
}
