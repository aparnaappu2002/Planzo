import { WalletEntity } from "../../domain/entities/wallet/walletEntity";
import { IwalletRepository } from "../../domain/interfaces/repositoryInterfaces/wallet/IwalletRepository";
import { IcreateWalletUseCase } from "../../domain/interfaces/useCaseInterfaces/wallet/IcreateWalletUseCase";
export class WalletCreationUseCase implements IcreateWalletUseCase {
    private walletDatabase: IwalletRepository
    constructor(walletDatabase: IwalletRepository) {
        this.walletDatabase = walletDatabase
    }
    async createWallet(walletDetails: WalletEntity): Promise<WalletEntity> {
        return await this.walletDatabase.createWallet(walletDetails)
    }
}