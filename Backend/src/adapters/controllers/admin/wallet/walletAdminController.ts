import { Request, Response } from "express";
import { IfindWalletUseCase } from "../../../../domain/interfaces/repositoryInterfaces/wallet/IfindWalletUseCase";
import { IfindTransactionsUseCase } from "../../../../domain/interfaces/useCaseInterfaces/trasaction/IfindTransactionUseCase";
import { HttpStatus } from "../../../../domain/entities/httpStatus";
import { IfindTransactionsByPaymentStatusUseCase } from "../../../../domain/interfaces/useCaseInterfaces/trasaction/IfindTrasactionByPaymentUseCase";

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
            const { transactions, totalPages } = await this.findTransactionDetailsUseCase.findTransactions(wallet?._id!, page)
            res.status(HttpStatus.OK).json({ message: "Admin wallet details fetched", wallet, transactions, totalPages })
        } catch (error) {
            console.log('error while finding admin wallet details', error)
            res.status(HttpStatus.BAD_REQUEST).json({ message: "Error while finding admin wallet details" })
        }
    }
    async handleFindWalletByPaymentStatus(req:Request,res:Response):Promise<void>{
        try {
        const { paymentStatus, pageNo, sortBy } = req.query;

    
        if (!paymentStatus || !["credit", "debit"].includes(paymentStatus as string)) {
            res.status(HttpStatus.BAD_REQUEST).json({
                message: "Invalid or missing paymentStatus. Must be 'credit' or 'debit'"
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

    } catch (error: any) {
        console.error("Error in handleFindTransactionsByPaymentStatus:", error);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            message: "Failed to fetch transactions",
            error: error.message || "Internal server error"
        });
    }
    }

}