
import { TicketAndVendorDTO } from "../../../domain/dto/ticket/ticketAndVendorDTO";
import { TransactionsEntity } from "../../../domain/entities/wallet/transactionEntity";
import { IticketRepositoryInterface } from "../../../domain/interfaces/repositoryInterfaces/ticket/IticketRepository";
import { ItransactionRepository } from "../../../domain/interfaces/repositoryInterfaces/transaction/ItransactionRepository";
import { IwalletRepository } from "../../../domain/interfaces/repositoryInterfaces/wallet/IwalletRepository";
import { ITicketCancelUseCase } from "../../../domain/interfaces/useCaseInterfaces/client/ticket/IticketCancelUseCase";
import { generateRandomUuid } from "../../../framework/services/randomUuid";
import { WalletEntity } from "../../../domain/entities/wallet/walletEntity";

export class TicketCancelUseCase implements ITicketCancelUseCase {
    private ticketDatabase: IticketRepositoryInterface
    private walletDatabase: IwalletRepository
    private transactionDatabase: ItransactionRepository
    constructor(ticketDatabase: IticketRepositoryInterface, walletDatabase: IwalletRepository, transactionDatabase: ItransactionRepository) {
        this.ticketDatabase = ticketDatabase
        this.walletDatabase = walletDatabase
        this.transactionDatabase = transactionDatabase
    }
    async ticketCancel(ticketId: string): Promise<TicketAndVendorDTO> {
        const cancelledTicket = await this.ticketDatabase.ticketCancel(ticketId)
        if (!cancelledTicket) throw new Error('No ticket found in this ID for cancellation')
        const refundAmountToVendor = cancelledTicket.totalAmount * 0.29
        const refundAmountToClient = cancelledTicket.totalAmount - (refundAmountToVendor + cancelledTicket.totalAmount * 0.01)
        
        let clientWallet = await this.walletDatabase.findWalletByUserId(cancelledTicket.clientId);
        if (!clientWallet) {
        console.log('Client wallet not found, creating new wallet for client:', cancelledTicket.clientId);
    
    
        const walletId = generateRandomUuid()
        const walletDetails: WalletEntity = {
            balance: 0,
            walletId,
            userModel: "client",
            userId: cancelledTicket.clientId,
        }
    
        const createWallet = await this.walletDatabase.createWallet(walletDetails)
        if (!createWallet) throw new Error('Failed to create client wallet')
    
        clientWallet = createWallet;
        console.log('Client wallet created successfully:', clientWallet);
        }
        const updateFundAmountToClient = await this.walletDatabase.addMoney(cancelledTicket.clientId, refundAmountToClient)
        if (!updateFundAmountToClient) throw new Error('Error while updating refund amount to client')
        const clientTransaction: TransactionsEntity = {
            amount: refundAmountToClient,
            currency: 'inr',
            paymentStatus: 'credit',
            paymentType: 'refund',
            walletId: updateFundAmountToClient._id!,
        }
        const updateClientTransaction = await this.transactionDatabase.createTransaction(clientTransaction)
        if (!updateClientTransaction) throw new Error('Error while creating client transction for ticket refund')
        console.log('this is the populated event', cancelledTicket)
        const deductMoneyFromVendor = await this.walletDatabase.reduceMoney(cancelledTicket.eventId.hostedBy, refundAmountToClient)
        if (!deductMoneyFromVendor) throw new Error('Error while deducting money from the vendor wallet')
        const vendorTransaction: TransactionsEntity = {
            amount: refundAmountToClient,
            currency: 'inr',
            paymentStatus: 'debit',
            paymentType: 'refund',
            walletId: deductMoneyFromVendor._id!,
        }
        const updateVendorTransaction = await this.transactionDatabase.createTransaction(vendorTransaction)
        if (!updateVendorTransaction) throw new Error('Error while creating client transction for ticket refund')

        return cancelledTicket
    }
}