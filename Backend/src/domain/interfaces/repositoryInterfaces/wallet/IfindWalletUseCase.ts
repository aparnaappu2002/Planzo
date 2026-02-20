import { FindWalletDTO } from "../../../dto/findWalletDTO"

export interface IfindWalletUseCase {
    findWallet(userId: string): Promise<FindWalletDTO>
}