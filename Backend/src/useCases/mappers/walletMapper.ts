import { WalletEntity } from "../../domain/entities/wallet/walletEntity";
import { FindWalletDTO } from "../../domain/dto/findWalletDTO";

export const mapWalletEntityToDTO = (wallet: WalletEntity): FindWalletDTO => ({
    _id: wallet._id?.toString(),
    walletId: wallet.walletId,
    balance: wallet.balance,
    createdAt: wallet.createdAt,
    userId: wallet.userId.toString(),
    userModel: wallet.userModel
});