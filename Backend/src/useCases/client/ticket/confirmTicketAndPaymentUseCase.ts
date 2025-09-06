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
        ticket: TicketEntity, 
        paymentIntent: string, 
        vendorId: string
    ): Promise<TicketEntity> {
        console.log('=== CONFIRM TICKET AND PAYMENT DEBUG ===');
        console.log('Vendor ID:', vendorId);
        console.log('Payment Intent:', paymentIntent);
        console.log('Ticket to confirm:', {
            ticketId: ticket.ticketId,
            variants: ticket.ticketVariants.map(v => ({ variant: v.variant, count: v.count, subtotal: v.subtotal })),
            totalAmount: ticket.totalAmount,
            ticketCount: ticket.ticketCount
        });

        if (!ticket) {
            throw new Error('No ticket provided for confirmation');
        }

        // Validate ticket variants
        if (!ticket.ticketVariants || ticket.ticketVariants.length === 0) {
            throw new Error('No ticket variants found in the ticket');
        }

        // Confirm the payment with Stripe
        const confirmPayment = await this.stripeService.confirmPayment(paymentIntent);
        if (confirmPayment.status !== 'succeeded') {
            throw new Error('Payment not successful');
        }

        console.log('Payment confirmed successfully');

        // Get total ticket count from the consolidated ticket
        const totalTicketCount = ticket.ticketCount;
        const totalAmount = ticket.totalAmount;

        console.log(`Total tickets: ${totalTicketCount}, Total amount: ₹${totalAmount}`);

        // Get event details and validate availability for each variant
        const eventId = typeof ticket.eventId === 'string' ? ticket.eventId : ticket.eventId!.toString();
        const eventDetails = await this.eventDatabase.findTotalTicketAndBookedTicket(eventId);
        if (!eventDetails) {
            throw new Error('Event not found');
        }

        // Check overall event availability
        const totalBookedTickets = eventDetails.ticketVariants.reduce((sum, variant) => sum + variant.ticketsSold, 0);
        const totalAvailableTickets = eventDetails.ticketVariants.reduce((sum, variant) => sum + variant.totalTickets, 0);

        if (totalBookedTickets > totalAvailableTickets) {
            throw new Error('Event tickets are sold out');
        } else if (totalBookedTickets + totalTicketCount > totalAvailableTickets) {
            throw new Error(`Not enough tickets available. Available: ${totalAvailableTickets - totalBookedTickets}, Requested: ${totalTicketCount}`);
        }

        // Validate each variant availability (this should have been checked during creation, but double-check)
        for (const ticketVariant of ticket.ticketVariants) {
            const eventVariant = eventDetails.ticketVariants.find(ev => 
                ev.type.toLowerCase() === ticketVariant.variant.toLowerCase()
            );
            
            if (!eventVariant) {
                throw new Error(`Variant ${ticketVariant.variant} not found in event`);
            }
            
            const availableForVariant = eventVariant.totalTickets - eventVariant.ticketsSold;
            if (ticketVariant.count > availableForVariant) {
                throw new Error(`Not enough ${ticketVariant.variant} tickets available. Available: ${availableForVariant}, Requested: ${ticketVariant.count}`);
            }
        }

        console.log('Ticket availability validated successfully');

        // Update payment status for the consolidated ticket
        console.log(`Updating payment status for ticket: ${ticket.ticketId}`);
        const updatedTicket = await this.ticketDatabase.updatePaymentstatus(ticket._id!);
        if (!updatedTicket) {
            throw new Error(`No ticket found with ID: ${ticket._id}`);
        }

        console.log('Successfully updated payment status for consolidated ticket');

        // Update variant-specific sold counts in the event
        for (const ticketVariant of ticket.ticketVariants) {
            console.log(`Updating variant ${ticketVariant.variant} sold count by ${ticketVariant.count}`);
            await this.eventDatabase.updateVariantTicketsSold(eventId, ticketVariant.variant, ticketVariant.count);
        }

        console.log('Updated all variant sold counts');

        // Process wallet transactions
        const adminId = process.env.ADMIN_ID;
        if (!adminId) throw new Error('NO admin id found');

        // Calculate commission and vendor payment
        const adminCommission = totalAmount * 0.01; // 1% commission
        const vendorPrice = totalAmount - adminCommission;

        console.log(`Admin commission: ₹${adminCommission.toFixed(2)}, Vendor payment: ₹${vendorPrice.toFixed(2)}`);

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
        console.log('Confirmed consolidated ticket successfully');
        console.log('Updated ticket:', {
            ticketId: updatedTicket.ticketId,
            variants: updatedTicket.ticketVariants.map(v => ({ 
                variant: v.variant, 
                count: v.count, 
                qrCodesCount: v.qrCodes.length 
            })),
            paymentStatus: updatedTicket.paymentStatus,
            ticketStatus: updatedTicket.ticketStatus,
            totalAmount: updatedTicket.totalAmount,
            totalCount: updatedTicket.ticketCount
        });
        console.log('=====================================');

        return updatedTicket;
    }
}