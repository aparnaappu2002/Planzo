import { TransactionsEntity } from "../../domain/entities/wallet/transactionEntity";
import { ItransactionRepository } from "../../domain/interfaces/repositoryInterfaces/transaction/ItransactionRepository";
import { IfindTransactionsByPaymentStatusUseCase } from "../../domain/interfaces/useCaseInterfaces/trasaction/IfindTrasactionByPaymentUseCase";

export class FindTransactionByPaymentUseCase implements IfindTransactionsByPaymentStatusUseCase{
    private transactionDatabase:ItransactionRepository
    constructor(transactionDatabase:ItransactionRepository)
    {
        this.transactionDatabase=transactionDatabase
    }
    async findTransactionByPaymentUseCase(paymentStatus: "credit" | "debit" | string, pageNo: number, sortBy?: string): Promise<{ transactions: TransactionsEntity[] | []; totalPages: number; total?: number; }> {
        const {transactions,totalPages,total}=await this.transactionDatabase.findTransactionsByPaymentStatus(paymentStatus,pageNo,sortBy)
        return {transactions,totalPages,total}
    }
}
