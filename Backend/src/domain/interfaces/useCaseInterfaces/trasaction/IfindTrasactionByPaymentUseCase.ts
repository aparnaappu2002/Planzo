import { TransactionsEntity } from "../../../entities/wallet/transactionEntity";
export interface IfindTransactionsByPaymentStatusUseCase{
    findTransactionByPaymentUseCase(paymentStatus:"credit"|"debit" | string,pageNo:number,sortBy?:string):Promise<{transactions:TransactionsEntity[]|[];totalPages:number,total?:number}>
}