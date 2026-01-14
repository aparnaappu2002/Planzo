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
exports.ConfirmTicketAndPaymentUseCase = void 0;
const randomUuid_1 = require("../../../framework/services/randomUuid");
class ConfirmTicketAndPaymentUseCase {
    constructor(stripeService, eventDatabase, ticketDatabase, walletDatabase, transactionDatabase) {
        this.ticketDatabase = ticketDatabase;
        this.walletDatabase = walletDatabase;
        this.transactionDatabase = transactionDatabase;
        this.stripeService = stripeService;
        this.eventDatabase = eventDatabase;
    }
    confirmTicketAndPayment(ticket, paymentIntent, vendorId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!ticket) {
                throw new Error('No ticket provided for confirmation');
            }
            // Validate ticket variants
            if (!ticket.ticketVariants || ticket.ticketVariants.length === 0) {
                throw new Error('No ticket variants found in the ticket');
            }
            // Confirm the payment with Stripe
            const confirmPayment = yield this.stripeService.confirmPayment(paymentIntent);
            if (confirmPayment.status !== 'succeeded') {
                throw new Error('Payment not successful');
            }
            const totalTicketCount = ticket.ticketCount;
            const totalAmount = ticket.totalAmount;
            const eventId = typeof ticket.eventId === 'string' ? ticket.eventId : ticket.eventId.toString();
            const eventDetails = yield this.eventDatabase.findTotalTicketAndBookedTicket(eventId);
            if (!eventDetails) {
                throw new Error('Event not found');
            }
            const totalBookedTickets = eventDetails.ticketVariants.reduce((sum, variant) => sum + variant.ticketsSold, 0);
            const totalAvailableTickets = eventDetails.ticketVariants.reduce((sum, variant) => sum + variant.totalTickets, 0);
            if (totalBookedTickets > totalAvailableTickets) {
                throw new Error('Event tickets are sold out');
            }
            else if (totalBookedTickets + totalTicketCount > totalAvailableTickets) {
                throw new Error(`Not enough tickets available. Available: ${totalAvailableTickets - totalBookedTickets}, Requested: ${totalTicketCount}`);
            }
            for (const ticketVariant of ticket.ticketVariants) {
                const eventVariant = eventDetails.ticketVariants.find(ev => ev.type.toLowerCase() === ticketVariant.variant.toLowerCase());
                if (!eventVariant) {
                    throw new Error(`Variant ${ticketVariant.variant} not found in event`);
                }
                const availableForVariant = eventVariant.totalTickets - eventVariant.ticketsSold;
                if (ticketVariant.count > availableForVariant) {
                    throw new Error(`Not enough ${ticketVariant.variant} tickets available. Available: ${availableForVariant}, Requested: ${ticketVariant.count}`);
                }
            }
            const updatedTicket = yield this.ticketDatabase.updatePaymentstatus(ticket._id);
            if (!updatedTicket) {
                throw new Error(`No ticket found with ID: ${ticket._id}`);
            }
            // Update variant-specific sold counts in the event
            for (const ticketVariant of ticket.ticketVariants) {
                console.log(`Updating variant ${ticketVariant.variant} sold count by ${ticketVariant.count}`);
                yield this.eventDatabase.updateVariantTicketsSold(eventId, ticketVariant.variant, ticketVariant.count);
            }
            // Process wallet transactions
            const adminId = process.env.ADMIN_ID;
            if (!adminId)
                throw new Error('NO admin id found');
            // Calculate commission and vendor payment
            const adminCommission = totalAmount * 0.01; // 1% commission
            const vendorPrice = totalAmount - adminCommission;
            console.log(`Admin commission: ₹${adminCommission.toFixed(2)}, Vendor payment: ₹${vendorPrice.toFixed(2)}`);
            // Process admin wallet transaction
            const adminWallet = yield this.walletDatabase.findWalletByUserId(adminId);
            if (!adminWallet)
                throw new Error("No admin Wallet found");
            const adminTransaction = {
                amount: adminCommission,
                currency: 'inr',
                paymentStatus: "credit",
                paymentType: "adminCommission",
                walletId: adminWallet._id,
            };
            yield this.transactionDatabase.createTransaction(adminTransaction);
            yield this.walletDatabase.addMoney(adminId, adminCommission);
            console.log('Admin commission processed successfully');
            // Process vendor wallet transaction
            let vendorWalletId;
            const vendorWallet = yield this.walletDatabase.findWalletByUserId(vendorId);
            if (vendorWallet) {
                vendorWalletId = vendorWallet._id;
                console.log('Using existing vendor wallet');
            }
            else {
                console.log('Creating new vendor wallet');
                const generatedWalletId = (0, randomUuid_1.generateRandomUuid)();
                const newVendorWallet = {
                    walletId: generatedWalletId,
                    balance: 0,
                    userId: vendorId,
                    userModel: "vendors",
                };
                const createdWallet = yield this.walletDatabase.createWallet(newVendorWallet);
                if (!createdWallet || !createdWallet._id) {
                    throw new Error("Failed to create vendor wallet.");
                }
                vendorWalletId = createdWallet._id;
            }
            const vendorTransactionData = {
                amount: vendorPrice,
                currency: 'inr',
                paymentStatus: 'credit',
                paymentType: "ticketBooking",
                walletId: vendorWalletId,
            };
            yield this.transactionDatabase.createTransaction(vendorTransactionData);
            yield this.walletDatabase.addMoney(vendorId, vendorPrice);
            return updatedTicket;
        });
    }
}
exports.ConfirmTicketAndPaymentUseCase = ConfirmTicketAndPaymentUseCase;
