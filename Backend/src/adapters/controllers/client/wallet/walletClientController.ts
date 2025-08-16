import { Request, Response } from "express";
import { IfindWalletUseCase } from "../../../../domain/interfaces/repositoryInterfaces/wallet/IfindWalletUseCase";
import { HttpStatus } from "../../../../domain/entities/httpStatus";
import { IfindTransactionsUseCase } from "../../../../domain/interfaces/useCaseInterfaces/trasaction/IfindTransactionUseCase";

export class ClientWalletController {
    private findClientWalletUseCase: IfindWalletUseCase
    private findTransactionOfUser: IfindTransactionsUseCase
    constructor(findClientWalletUseCase: IfindWalletUseCase, findTransactionOfUser: IfindTransactionsUseCase) {
        this.findClientWalletUseCase = findClientWalletUseCase
        this.findTransactionOfUser = findTransactionOfUser
    }
    async handleFindClientWallet(req: Request, res: Response): Promise<void> {
        try {
            const { userId, pageNo } = req.params
            const page = parseInt(pageNo, 10) || 1
            const wallet = await this.findClientWalletUseCase.findWallet(userId)
            const { transactions, totalPages } = await this.findTransactionOfUser.findTransactions(wallet?._id!, page)
            res.status(HttpStatus.OK).json({ message: "Wallet found", wallet, transactions, totalPages })
        } catch (error) {
            console.log('error while finding client wallet', error)
            res.status(HttpStatus.BAD_REQUEST).json({
                message: "error while finding client wallet",
                error: error instanceof Error ? error.message : 'error while finding client wallet'
            })
        }
    }
}