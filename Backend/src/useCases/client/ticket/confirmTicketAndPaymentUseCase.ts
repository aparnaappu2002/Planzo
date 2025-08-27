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
    
    constructor(
        stripeService: IStripeService, 
        eventDatabase: IeventRepository, 
        ticketDatabase: IticketRepositoryInterface, 
        walletDatabase: IwalletRepository, 
        transactionDatabase: ItransactionRepository
    ) {
        this.ticketDatabase = ticketDatabase
        this.walletDatabase = walletDatabase
        this.transactionDatabase = transactionDatabase
        this.stripeService = stripeService
        this.eventDatabase = eventDatabase
    }

    async confirmTicketAndPayment(
        tickets: TicketEntity[], 
        paymentIntent: string, 
        vendorId: string
    ): Promise<TicketEntity[]> {
        console.log('=== CONFIRM TICKET AND PAYMENT DEBUG ===');
        console.log('Vendor ID:', vendorId);
        console.log('Payment Intent:', paymentIntent);
        console.log('Tickets to confirm:', tickets.length);
        console.log('Tickets details:', tickets.map(t => ({
            ticketId: t.ticketId,
            variant: t.ticketVariant,
            amount: t.totalAmount
        })));

        if (!tickets || tickets.length === 0) {
            throw new Error('No tickets provided for confirmation');
        }

        // Confirm the payment with Stripe
        const confirmPayment = await this.stripeService.confirmPayment(paymentIntent);
        if (confirmPayment.status !== 'succeeded') {
            throw new Error('Payment not successful');
        }

        console.log('Payment confirmed successfully');

        // Calculate total ticket count and amount
        const totalTicketCount = tickets.length; // Each ticket entity represents 1 ticket
        const totalAmount = tickets.reduce((sum, ticket) => sum + ticket.totalAmount, 0);

        console.log(`Total tickets: ${totalTicketCount}, Total amount: ₹${totalAmount}`);

        // Get event details and validate availability
        const eventDetails = await this.eventDatabase.findTotalTicketCountAndticketPurchased(tickets[0].eventId!);
        if (eventDetails.ticketPurchased > eventDetails.totalTicket) {
            throw new Error('Ticket full Sold out');
        } else if (eventDetails.ticketPurchased + totalTicketCount > eventDetails.totalTicket) {
            throw new Error(`Not enough tickets available. Available: ${eventDetails.totalTicket - eventDetails.ticketPurchased}, Requested: ${totalTicketCount}`);
        }

        // Update event ticket purchase count
        const newTicketPurchasedCount = eventDetails.ticketPurchased + totalTicketCount;
        await this.eventDatabase.updateTicketPurchaseCount(tickets[0].eventId!, newTicketPurchasedCount);

        console.log(`Updated event ticket count from ${eventDetails.ticketPurchased} to ${newTicketPurchasedCount}`);

        // Update payment status for all tickets
        const updatedTickets: TicketEntity[] = [];
        for (const ticket of tickets) {
            console.log(`Updating payment status for ticket: ${ticket.ticketId}`);
            const updatedTicket = await this.ticketDatabase.updatePaymentstatus(ticket._id!);
            if (!updatedTicket) {
                throw new Error(`No ticket found with ID: ${ticket._id}`);
            }
            updatedTickets.push(updatedTicket);
        }

        console.log(`Successfully updated payment status for ${updatedTickets.length} tickets`);

        // Process wallet transactions
        const adminId = process.env.ADMIN_ID;
        if (!adminId) throw new Error('NO admin id found');

        // Calculate commission and vendor payment
        const adminCommission = totalAmount * 0.01; // 1% commission
        const vendorPrice = totalAmount - adminCommission;

        console.log(`Admin commission: ₹${adminCommission}, Vendor payment: ₹${vendorPrice}`);

        // Process admin wallet transaction
        const adminWallet = await this.walletDatabase.findWalletByUserId(adminId);
        if (!adminWallet) throw new Error("No admin Wallet found");

        const adminTransaction: TransactionsEntity = {
            amount: adminCommission,
            currency: 'inr',
            paymentStatus: "credit",
            paymentType: "adminCommission",
            walletId: adminWallet._id!,
        };

        await this.transactionDatabase.createTransaction(adminTransaction);
        await this.walletDatabase.addMoney(adminId, adminCommission);

        console.log('Admin commission processed successfully');

        // Process vendor wallet transaction
        let vendorWalletId: string | ObjectId;
        const vendorWallet = await this.walletDatabase.findWalletByUserId(vendorId);

        if (vendorWallet) {
            vendorWalletId = vendorWallet._id!;
            console.log('Using existing vendor wallet');
        } else {
            console.log('Creating new vendor wallet');
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

        await this.transactionDatabase.createTransaction(vendorTransactionData);
        await this.walletDatabase.addMoney(vendorId, vendorPrice);

        console.log('Vendor payment processed successfully');

        console.log('=== CONFIRMATION COMPLETED ===');
        console.log(`Confirmed ${updatedTickets.length} tickets successfully`);
        console.log('Updated tickets:', updatedTickets.map(t => ({
            ticketId: t.ticketId,
            variant: t.ticketVariant,
            paymentStatus: t.paymentStatus
        })));
        console.log('=====================================');

        return updatedTickets;
    }
}