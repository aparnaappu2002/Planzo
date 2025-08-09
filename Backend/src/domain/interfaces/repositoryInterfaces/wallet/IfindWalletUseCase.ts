import { WalletEntity } from "../../../entities/wallet/walletEntity"

export interface IfindWalletUseCase {
    findWallet(userId: string): Promise<WalletEntity | null>
}