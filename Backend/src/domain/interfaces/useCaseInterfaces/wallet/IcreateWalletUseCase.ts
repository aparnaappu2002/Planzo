import { WalletEntity } from "../../../entities/wallet/walletEntity"

export interface IcreateWalletUseCase {
    createWallet(walletDetails: WalletEntity): Promise<WalletEntity>
}