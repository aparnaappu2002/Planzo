import { IwalletRepository } from "../../domain/interfaces/repositoryInterfaces/wallet/IwalletRepository";
import { IfindWalletUseCase } from "../../domain/interfaces/repositoryInterfaces/wallet/IfindWalletUseCase";
import { mapWalletEntityToDTO } from "../mappers/walletMapper";
import { FindWalletDTO } from "../../domain/dto/findWalletDTO";

export class FindWalletUseCase implements IfindWalletUseCase {
    private walletDatabase: IwalletRepository
    constructor(walletDatabase: IwalletRepository) {
        this.walletDatabase = walletDatabase
    }
    async findWallet(userId: string): Promise<FindWalletDTO> {
        const wallet = await this.walletDatabase.findWalletByUserId(userId)
        if (!wallet) throw new Error("No wallet found in this userId")
        return mapWalletEntityToDTO(wallet);

    }
}
