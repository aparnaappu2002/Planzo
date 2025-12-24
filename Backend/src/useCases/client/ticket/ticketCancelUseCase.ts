import { TicketAndVendorDTO } from "../../../domain/dto/ticket/ticketAndVendorDTO";
import { TransactionsEntity } from "../../../domain/entities/wallet/transactionEntity";
import { IticketRepositoryInterface } from "../../../domain/interfaces/repositoryInterfaces/ticket/IticketRepository";
import { ItransactionRepository } from "../../../domain/interfaces/repositoryInterfaces/transaction/ItransactionRepository";
import { IwalletRepository } from "../../../domain/interfaces/repositoryInterfaces/wallet/IwalletRepository";
import { ITicketCancelUseCase } from "../../../domain/interfaces/useCaseInterfaces/client/ticket/IticketCancelUseCase";
import { IStripePayoutService } from "../../../domain/interfaces/serviceInterface/IStripePayoutService";
import { generateRandomUuid } from "../../../framework/services/randomUuid";
import { WalletEntity } from "../../../domain/entities/wallet/walletEntity";

export class TicketCancelUseCase implements ITicketCancelUseCase {
    private ticketDatabase: IticketRepositoryInterface
    private walletDatabase: IwalletRepository
    private transactionDatabase: ItransactionRepository
    private stripePayoutService: IStripePayoutService

    constructor(
        ticketDatabase: IticketRepositoryInterface, 
        walletDatabase: IwalletRepository, 
        transactionDatabase: ItransactionRepository,
        stripePayoutService: IStripePayoutService
    ) {
        this.ticketDatabase = ticketDatabase
        this.walletDatabase = walletDatabase
        this.transactionDatabase = transactionDatabase
        this.stripePayoutService = stripePayoutService
    }

    async ticketCancel(ticketId: string, refundMethod?: 'wallet' | 'bank'): Promise<TicketAndVendorDTO> {
        const cancelledTicket = await this.ticketDatabase.ticketCancel(ticketId, refundMethod)
        console.log("CancelledTicket:",cancelledTicket)
        if (!cancelledTicket) throw new Error('No ticket found in this ID for cancellation')
        
        const refundAmountToVendor = cancelledTicket.totalAmount * 0.29
        const refundAmountToClient = cancelledTicket.totalAmount - (refundAmountToVendor + cancelledTicket.totalAmount * 0.01)
        
        // Check if refund method is bank transfer
        if (refundMethod === 'bank') {
            console.log('[TicketCancel] Processing bank transfer payout via Stripe');
            
            try {

                if (!cancelledTicket.paymentId) {
        throw new Error('Payment ID not found. Cannot process bank refund.');
    }

                
                const stripePayout = await this.stripePayoutService.createRefund(
                    cancelledTicket.paymentId,
                    refundAmountToClient,
                    'requested_by_customer'
                );
                
                console.log('[TicketCancel] Stripe payout processed:', stripePayout.id);
            } catch (stripeError) {
                console.error('[TicketCancel] Stripe payout failed:', stripeError);
                throw new Error('Failed to process bank transfer. Ticket cancellation aborted.');
            }

            // Ensure client wallet exists for transaction recording
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

            // Record client transaction (Bank payout - no wallet balance change, just for records)
            const clientTransaction: TransactionsEntity = {
                amount: refundAmountToClient,
                currency: 'inr',
                paymentStatus: 'credit',
                paymentType: 'stripe_refund',
                walletId: clientWallet._id!,
            }
            const updateClientTransaction = await this.transactionDatabase.createTransaction(clientTransaction)
            if (!updateClientTransaction) throw new Error('Error while creating client transaction for bank transfer')

            // Deduct from vendor wallet (vendor loses the refunded amount)
            const deductMoneyFromVendor = await this.walletDatabase.reduceMoney(
                cancelledTicket.eventId.hostedBy, 
                refundAmountToClient
            )
            if (!deductMoneyFromVendor) throw new Error('Error while deducting money from the vendor wallet')
            
            // Record vendor transaction
            const vendorTransaction: TransactionsEntity = {
                amount: refundAmountToClient,
                currency: 'inr',
                paymentStatus: 'debit',
                paymentType: 'stripe_refund',
                walletId: deductMoneyFromVendor._id!,
            }
            const updateVendorTransaction = await this.transactionDatabase.createTransaction(vendorTransaction)
            if (!updateVendorTransaction) throw new Error('Error while creating vendor transaction for bank transfer')

            console.log('[TicketCancel] Bank transfer refund completed successfully');

        } else {
            console.log('[TicketCancel] Processing wallet refund');
            
            // Wallet payment - process wallet refund (default behavior)
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

            // Add money to client wallet
            const updateFundAmountToClient = await this.walletDatabase.addMoney(
                cancelledTicket.clientId, 
                refundAmountToClient
            )
            if (!updateFundAmountToClient) throw new Error('Error while updating refund amount to client')
            
            // Record client transaction
            const clientTransaction: TransactionsEntity = {
                amount: refundAmountToClient,
                currency: 'inr',
                paymentStatus: 'credit',
                paymentType: 'refund',
                walletId: updateFundAmountToClient._id!,
            }
            const updateClientTransaction = await this.transactionDatabase.createTransaction(clientTransaction)
            if (!updateClientTransaction) throw new Error('Error while creating client transaction for wallet refund')
            
            console.log('Wallet refund processed for client:', cancelledTicket.clientId)
            
            // Deduct from vendor wallet
            const deductMoneyFromVendor = await this.walletDatabase.reduceMoney(
                cancelledTicket.eventId.hostedBy, 
                refundAmountToClient
            )
            if (!deductMoneyFromVendor) throw new Error('Error while deducting money from the vendor wallet')
            
            // Record vendor transaction
            const vendorTransaction: TransactionsEntity = {
                amount: refundAmountToClient,
                currency: 'inr',
                paymentStatus: 'debit',
                paymentType: 'refund',
                walletId: deductMoneyFromVendor._id!,
            }
            const updateVendorTransaction = await this.transactionDatabase.createTransaction(vendorTransaction)
            if (!updateVendorTransaction) throw new Error('Error while creating vendor transaction for wallet refund')

            console.log('[TicketCancel] Wallet refund completed successfully');
        }

        return cancelledTicket
    }
}