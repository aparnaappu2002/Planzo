import { ObjectId } from "mongoose";
import { TicketEntity } from "../../../domain/entities/ticket/ticketEntity";
import { TicketFromFrontend } from "../../../domain/entities/ticket/ticketFromFrontend";
import { TransactionsEntity } from "../../../domain/entities/wallet/transactionEntity";
import { WalletEntity } from "../../../domain/entities/wallet/walletEntity";
import { IeventRepository } from "../../../domain/interfaces/repositoryInterfaces/event/IeventRepository";
import { IticketRepositoryInterface } from "../../../domain/interfaces/repositoryInterfaces/ticket/IticketRepository";
import { ItransactionRepository } from "../../../domain/interfaces/repositoryInterfaces/transaction/ItransactionRepository";
import { IwalletRepository } from "../../../domain/interfaces/repositoryInterfaces/wallet/IwalletRepository";
import { IStripeService } from "../../../domain/interfaces/serviceInterface/IstripeService";
import { IconfirmTicketAndPaymentUseCase } from "../../../domain/interfaces/useCaseInterfaces/client/ticket/IconfirmTicketAndPayment";
import { generateRandomUuid } from "../../../framework/services/randomUuid";

export class ConfirmTicketAndPaymentUseCase implements IconfirmTicketAndPaymentUseCase {
    private ticketDatabase: IticketRepositoryInterface
    private walletDatabase: IwalletRepository
    private transactionDatabase: ItransactionRepository
    private stripeService: IStripeService
    private eventDatabase: IeventRepository
    constructor(stripeService: IStripeService, eventDatabase: IeventRepository, ticketDatabase: IticketRepositoryInterface, walletDatabase: IwalletRepository, transactionDatabase: ItransactionRepository) {
        this.ticketDatabase = ticketDatabase
        this.walletDatabase = walletDatabase
        this.transactionDatabase = transactionDatabase
        this.stripeService = stripeService
        this.eventDatabase = eventDatabase
    }
    async confirmTicketAndPayment(ticket: TicketEntity, paymentIntent: string, vendorId: string): Promise<TicketEntity> {
        console.log('vendor id in useCase', vendorId)
        const confirmPayment = await this.stripeService.confirmPayment(paymentIntent)
        if (confirmPayment.status !== 'succeeded') {
            throw new Error('Payment not successful');
        }
        const eventDetails = await this.eventDatabase.findTotalTicketCountAndticketPurchased(ticket.eventId!)
        if (eventDetails.ticketPurchased > eventDetails.totalTicket) {
            throw new Error('Ticket full Sold out')
        } else if (eventDetails.ticketPurchased + ticket.ticketCount > eventDetails.totalTicket) {
            throw new Error('Not enough ticket available')
        }
        const newTicketPurchasedCount = eventDetails.ticketPurchased + ticket.ticketCount
        const updateTicketCount = await this.eventDatabase.updateTicketPurchaseCount(ticket.eventId!, newTicketPurchasedCount)
        const updatedTicket = await this.ticketDatabase.updatePaymentstatus(ticket._id!)
        if (!updatedTicket) throw new Error("No ticket found in this ID")
        const adminId = process.env.ADMIN_ID
        if (!adminId) throw new Error('NO admin id found')
        const adminCommision = ticket.totalAmount * 0.01
        const vendorPrice = ticket.totalAmount - adminCommision
        const adminWallet = await this.walletDatabase.findWalletByUserId(adminId!)
        if (!adminWallet) throw new Error("No admin Wallet found in this ID")
        const adminTransaction: TransactionsEntity = {
            amount: adminCommision,
            currency: 'inr',
            paymentStatus: "credit",
            paymentType: "adminCommission",
            walletId: adminWallet._id!,
        }

        const transaction = await this.transactionDatabase.createTransaction(adminTransaction)
        const adminWalletMoneyAdding = await this.walletDatabase.addMoney(adminId, adminCommision)
        const vendorWallet = await this.walletDatabase.findWalletByUserId(vendorId)

        let vendorWalletId: string | ObjectId;

        if (vendorWallet) {
            vendorWalletId = vendorWallet._id!;
        } else {
            const generatedWalletId = generateRandomUuid();
            const newVendorWallet: WalletEntity = {
                walletId: generatedWalletId,
                balance: 0,
                userId: vendorId,
                userModel: "vendors",
            };

            const createdWallet = await this.walletDatabase.createWallet(newVendorWallet);
            if (!createdWallet || !createdWallet._id) {
                throw new Error("Failed to create vendor wallet.");
            }

            vendorWalletId = createdWallet._id;
        }

        const vendorTransactionData: TransactionsEntity = {
            amount: vendorPrice,
            currency: 'inr',
            paymentStatus: 'credit',
            paymentType: "ticketBooking",
            walletId: vendorWalletId,
        };
        const vendorTransaction = await this.transactionDatabase.createTransaction(vendorTransactionData)
        const addMoneyToVendorWallet = await this.walletDatabase.addMoney(vendorId, vendorPrice)
        return updatedTicket
    }
}