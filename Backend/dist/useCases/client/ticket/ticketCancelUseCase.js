"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketCancelUseCase = void 0;
const randomUuid_1 = require("../../../framework/services/randomUuid");
class TicketCancelUseCase {
    constructor(ticketDatabase, walletDatabase, transactionDatabase, stripePayoutService) {
        this.ticketDatabase = ticketDatabase;
        this.walletDatabase = walletDatabase;
        this.transactionDatabase = transactionDatabase;
        this.stripePayoutService = stripePayoutService;
    }
    ticketCancel(ticketId, refundMethod) {
        return __awaiter(this, void 0, void 0, function* () {
            const cancelledTicket = yield this.ticketDatabase.ticketCancel(ticketId, refundMethod);
            console.log("CancelledTicket:", cancelledTicket);
            if (!cancelledTicket)
                throw new Error('No ticket found in this ID for cancellation');
            const refundAmountToVendor = cancelledTicket.totalAmount * 0.29;
            const refundAmountToClient = cancelledTicket.totalAmount - (refundAmountToVendor + cancelledTicket.totalAmount * 0.01);
            // Check if refund method is bank transfer
            if (refundMethod === 'bank') {
                console.log('[TicketCancel] Processing bank transfer payout via Stripe');
                try {
                    if (!cancelledTicket.paymentId) {
                        throw new Error('Payment ID not found. Cannot process bank refund.');
                    }
                    const stripePayout = yield this.stripePayoutService.createRefund(cancelledTicket.paymentId, refundAmountToClient, 'requested_by_customer');
                    console.log('[TicketCancel] Stripe payout processed:', stripePayout.id);
                }
                catch (stripeError) {
                    console.error('[TicketCancel] Stripe payout failed:', stripeError);
                    throw new Error('Failed to process bank transfer. Ticket cancellation aborted.');
                }
                // Ensure client wallet exists for transaction recording
                let clientWallet = yield this.walletDatabase.findWalletByUserId(cancelledTicket.clientId);
                if (!clientWallet) {
                    console.log('Client wallet not found, creating new wallet for client:', cancelledTicket.clientId);
                    const walletId = (0, randomUuid_1.generateRandomUuid)();
                    const walletDetails = {
                        balance: 0,
                        walletId,
                        userModel: "client",
                        userId: cancelledTicket.clientId,
                    };
                    const createWallet = yield this.walletDatabase.createWallet(walletDetails);
                    if (!createWallet)
                        throw new Error('Failed to create client wallet');
                    clientWallet = createWallet;
                    console.log('Client wallet created successfully:', clientWallet);
                }
                // Record client transaction (Bank payout - no wallet balance change, just for records)
                const clientTransaction = {
                    amount: refundAmountToClient,
                    currency: 'inr',
                    paymentStatus: 'credit',
                    paymentType: 'stripe_refund',
                    walletId: clientWallet._id,
                };
                const updateClientTransaction = yield this.transactionDatabase.createTransaction(clientTransaction);
                if (!updateClientTransaction)
                    throw new Error('Error while creating client transaction for bank transfer');
                // Deduct from vendor wallet (vendor loses the refunded amount)
                const deductMoneyFromVendor = yield this.walletDatabase.reduceMoney(cancelledTicket.eventId.hostedBy, refundAmountToClient);
                if (!deductMoneyFromVendor)
                    throw new Error('Error while deducting money from the vendor wallet');
                // Record vendor transaction
                const vendorTransaction = {
                    amount: refundAmountToClient,
                    currency: 'inr',
                    paymentStatus: 'debit',
                    paymentType: 'stripe_refund',
                    walletId: deductMoneyFromVendor._id,
                };
                const updateVendorTransaction = yield this.transactionDatabase.createTransaction(vendorTransaction);
                if (!updateVendorTransaction)
                    throw new Error('Error while creating vendor transaction for bank transfer');
                console.log('[TicketCancel] Bank transfer refund completed successfully');
            }
            else {
                console.log('[TicketCancel] Processing wallet refund');
                // Wallet payment - process wallet refund (default behavior)
                let clientWallet = yield this.walletDatabase.findWalletByUserId(cancelledTicket.clientId);
                if (!clientWallet) {
                    console.log('Client wallet not found, creating new wallet for client:', cancelledTicket.clientId);
                    const walletId = (0, randomUuid_1.generateRandomUuid)();
                    const walletDetails = {
                        balance: 0,
                        walletId,
                        userModel: "client",
                        userId: cancelledTicket.clientId,
                    };
                    const createWallet = yield this.walletDatabase.createWallet(walletDetails);
                    if (!createWallet)
                        throw new Error('Failed to create client wallet');
                    clientWallet = createWallet;
                    console.log('Client wallet created successfully:', clientWallet);
                }
                // Add money to client wallet
                const updateFundAmountToClient = yield this.walletDatabase.addMoney(cancelledTicket.clientId, refundAmountToClient);
                if (!updateFundAmountToClient)
                    throw new Error('Error while updating refund amount to client');
                // Record client transaction
                const clientTransaction = {
                    amount: refundAmountToClient,
                    currency: 'inr',
                    paymentStatus: 'credit',
                    paymentType: 'refund',
                    walletId: updateFundAmountToClient._id,
                };
                const updateClientTransaction = yield this.transactionDatabase.createTransaction(clientTransaction);
                if (!updateClientTransaction)
                    throw new Error('Error while creating client transaction for wallet refund');
                console.log('Wallet refund processed for client:', cancelledTicket.clientId);
                // Deduct from vendor wallet
                const deductMoneyFromVendor = yield this.walletDatabase.reduceMoney(cancelledTicket.eventId.hostedBy, refundAmountToClient);
                if (!deductMoneyFromVendor)
                    throw new Error('Error while deducting money from the vendor wallet');
                // Record vendor transaction
                const vendorTransaction = {
                    amount: refundAmountToClient,
                    currency: 'inr',
                    paymentStatus: 'debit',
                    paymentType: 'refund',
                    walletId: deductMoneyFromVendor._id,
                };
                const updateVendorTransaction = yield this.transactionDatabase.createTransaction(vendorTransaction);
                if (!updateVendorTransaction)
                    throw new Error('Error while creating vendor transaction for wallet refund');
                console.log('[TicketCancel] Wallet refund completed successfully');
            }
            return cancelledTicket;
        });
    }
}
exports.TicketCancelUseCase = TicketCancelUseCase;
