import { Request, Response } from "express";
import { IfindWalletUseCase } from "../../../../domain/interfaces/repositoryInterfaces/wallet/IfindWalletUseCase";
import { IfindTransactionsUseCase } from "../../../../domain/interfaces/useCaseInterfaces/trasaction/IfindTransactionUseCase";
import { HttpStatus } from "../../../../domain/enums/httpStatus";
import { IfindTransactionsByPaymentStatusUseCase } from "../../../../domain/interfaces/useCaseInterfaces/trasaction/IfindTrasactionByPaymentUseCase";
import { Messages } from "../../../../domain/enums/messages";

export class FindAdminWalletDetailsController {
    private findWalletDetailsUseCase: IfindWalletUseCase
    private findTransactionDetailsUseCase: IfindTransactionsUseCase
    private findTransactionByPaymentStatusUseCase:IfindTransactionsByPaymentStatusUseCase
    constructor(findWalletDetailsUseCase: IfindWalletUseCase, findTransactionDetailsUseCase: IfindTransactionsUseCase,findTransactionByPaymentStatusUseCase:IfindTransactionsByPaymentStatusUseCase) {
        this.findTransactionDetailsUseCase = findTransactionDetailsUseCase
        this.findWalletDetailsUseCase = findWalletDetailsUseCase
        this.findTransactionByPaymentStatusUseCase=findTransactionByPaymentStatusUseCase
    }
    async handleFindWalletDetails(req: Request, res: Response): Promise<void> {
        try {
            const { userId, pageNo } = req.params
            const page = parseInt(pageNo, 10) || 1
            const wallet = await this.findWalletDetailsUseCase.findWallet(userId)
            if (!wallet?._id) {
    res.status(HttpStatus.BAD_REQUEST).json({ message: Messages.WALLET_FETCH_ERROR });
    return;
}

            const { transactions, totalPages } = await this.findTransactionDetailsUseCase.findTransactions(wallet._id, page)
            res.status(HttpStatus.OK).json({ message: Messages.WALLET_FETCHED, wallet, transactions, totalPages })
        } catch (error) {
            console.log('error while finding admin wallet details', error)
            res.status(HttpStatus.BAD_REQUEST).json({ message: Messages.WALLET_FETCH_ERROR })
        }
    }
    async handleFindWalletByPaymentStatus(req:Request,res:Response):Promise<void>{
        try {
        const { paymentStatus, pageNo, sortBy } = req.query;

    
        if (!paymentStatus || !["credit", "debit"].includes(paymentStatus as string)) {
            res.status(HttpStatus.BAD_REQUEST).json({
                message: Messages.INVALID_PAYMENT_STATUS
            });
            return;
        }

        const page = parseInt(pageNo as string, 10) || 1;
        const sort = (sortBy as string) || "newest";

        const result = await this.findTransactionByPaymentStatusUseCase.findTransactionByPaymentUseCase(paymentStatus as "credit" | "debit",page,sort);


        res.status(HttpStatus.OK).json({
            message: `All ${paymentStatus} transactions fetched successfully`,
            transactions: result.transactions,
            totalPages: result.totalPages,
            total: result.total,
            page,
            sortBy: sort
        });

    } catch (error: unknown) {
        console.error("Error in handleFindTransactionsByPaymentStatus:", error);
        
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            message: Messages.TRANSACTION_FETCH_ERROR,
            error:  Messages.TRANSACTION_FETCH_ERROR
        });
    }
    }

}