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
exports.CreateTicketUseCase = void 0;
const randomUuid_1 = require("../../../framework/services/randomUuid");
class CreateTicketUseCase {
    constructor(eventDatabase, ticketDatabase, stripe, genQr, paymentDatabase) {
        this.ticketDatabase = ticketDatabase;
        this.stripe = stripe;
        this.genQr = genQr;
        this.paymentDatabase = paymentDatabase;
        this.eventDatabase = eventDatabase;
    }
    createTicket(ticketData, totalCount, totalAmount, vendorId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!ticketData.ticketVariants || typeof ticketData.ticketVariants !== 'object') {
                throw new Error('Invalid ticket variants data structure');
            }
            const selectedVariants = Object.entries(ticketData.ticketVariants)
                .filter(([variantType, quantity]) => quantity > 0);
            if (selectedVariants.length === 0) {
                throw new Error('No ticket variants selected');
            }
            const validVariants = ['standard', 'premium', 'vip'];
            for (const [variantType] of selectedVariants) {
                if (!validVariants.includes(variantType)) {
                    throw new Error(`Invalid variant type: ${variantType}. Valid types are: ${validVariants.join(', ')}`);
                }
            }
            const eventDetails = yield this.eventDatabase.findTotalTicketAndBookedTicket(ticketData.eventId);
            console.log('Event Details:', JSON.stringify(eventDetails, null, 2));
            if (!eventDetails)
                throw new Error('No event found with this ID');
            // Check event status
            if (eventDetails.status === "completed")
                throw new Error("This event is already completed");
            if (eventDetails.status === 'cancelled')
                throw new Error("This event is already cancelled");
            if (!eventDetails.ticketVariants || eventDetails.ticketVariants.length === 0) {
                throw new Error('No ticket variants available for this event');
            }
            const ticketVariantsToCreate = [];
            let calculatedAmount = 0;
            let totalTicketCount = 0;
            // Process each selected variant
            for (const [variantType, quantity] of selectedVariants) {
                console.log(`Processing variant: ${variantType}, quantity: ${quantity}`);
                // Find the variant by type (case insensitive comparison)
                const selectedVariant = eventDetails.ticketVariants.find(variant => variant.type.toLowerCase() === variantType.toLowerCase());
                if (!selectedVariant) {
                    throw new Error(`Ticket variant '${variantType}' not found for this event. Available variants: ${eventDetails.ticketVariants.map(v => v.type).join(', ')}`);
                }
                console.log(`Found variant:`, selectedVariant);
                // Check variant availability
                const availableTickets = selectedVariant.totalTickets - selectedVariant.ticketsSold;
                if (availableTickets <= 0) {
                    throw new Error(`${variantType.toUpperCase()} tickets are sold out`);
                }
                if (quantity > availableTickets) {
                    throw new Error(`Only ${availableTickets} ${variantType.toUpperCase()} tickets are available. Please reduce the quantity.`);
                }
                // Check max tickets per user for this variant
                if (quantity > selectedVariant.maxPerUser) {
                    throw new Error(`Maximum ${selectedVariant.maxPerUser} ${variantType.toUpperCase()} tickets allowed per user`);
                }
                // Calculate amounts for this variant
                const variantSubtotal = selectedVariant.price * quantity;
                calculatedAmount += variantSubtotal;
                totalTicketCount += quantity;
                // Create QR codes for this variant
                const qrCodes = [];
                for (let i = 0; i < quantity; i++) {
                    const qrId = `${variantType}_${(0, randomUuid_1.generateRandomUuid)()}_${i + 1}`;
                    const hostName = process.env.HOSTNAME;
                    if (!hostName)
                        throw new Error("No hostname found");
                    const qrLink = `${hostName}/verifyTicket/${qrId}/${ticketData.eventId}`;
                    const qrCodeLink = yield this.genQr.createQrLink(qrLink);
                    if (!qrCodeLink)
                        throw new Error('Error while creating QR code link');
                    qrCodes.push({
                        qrId: qrId,
                        qrCodeLink: qrCodeLink,
                        status: 'unused',
                        checkInHistory: []
                    });
                }
                // Add variant to ticket with proper type casting
                ticketVariantsToCreate.push({
                    variant: variantType,
                    count: quantity,
                    pricePerTicket: selectedVariant.price,
                    subtotal: variantSubtotal,
                    qrCodes: qrCodes
                });
            }
            // Validate total amount (allow small floating point differences)
            if (Math.abs(totalAmount - calculatedAmount) > 0.01) {
                throw new Error(`Price mismatch. Expected: ₹${calculatedAmount.toFixed(2)}, Received: ₹${totalAmount.toFixed(2)}`);
            }
            // Validate total count
            if (totalCount !== totalTicketCount) {
                throw new Error(`Ticket count mismatch. Expected: ${totalTicketCount}, Received: ${totalCount}`);
            }
            if (ticketVariantsToCreate.length === 0) {
                throw new Error('No ticket variants to create');
            }
            // Generate main ticket ID
            const mainTicketId = (0, randomUuid_1.generateRandomUuid)();
            if (!mainTicketId)
                throw new Error('Error while creating ticket ID');
            // Create a single main QR code for the ticket
            const hostName = process.env.HOSTNAME;
            if (!hostName)
                throw new Error("No hostname found");
            const mainQrLink = `${hostName}/verifyTicket/${mainTicketId}/${ticketData.eventId}`;
            const mainQrCodeLink = yield this.genQr.createQrLink(mainQrLink);
            if (!mainQrCodeLink)
                throw new Error('Error while creating main QR code link');
            // Create Stripe payment intent with metadata
            const stripeMetadata = {
                ticketId: mainTicketId,
                eventId: ticketData.eventId,
                clientId: ticketData.clientId,
                totalTickets: totalTicketCount.toString(),
                totalAmount: totalAmount.toString()
            };
            // Get both clientSecret and paymentIntentId from Stripe
            const { clientSecret, paymentIntentId } = yield this.stripe.createPaymentIntent(totalAmount, 'ticket', stripeMetadata);
            console.log('Stripe Payment Intent created:', { clientSecret, paymentIntentId });
            if (!clientSecret || !paymentIntentId) {
                throw new Error("Error while creating Stripe payment intent");
            }
            // Create payment document with the paymentIntentId
            const paymentDetails = {
                amount: totalAmount,
                currency: 'inr',
                paymentId: paymentIntentId,
                receiverId: vendorId,
                purpose: 'ticketBooking',
                status: "pending",
                userId: ticketData.clientId,
                ticketId: mainTicketId,
            };
            const paymentDocumentCreation = yield this.paymentDatabase.createPayment(paymentDetails);
            if (!paymentDocumentCreation)
                throw new Error('Error while creating payment document');
            // Create ticket entity
            const ticket = {
                clientId: ticketData.clientId,
                email: ticketData.email,
                phone: ticketData.phone,
                eventId: ticketData.eventId,
                ticketId: mainTicketId,
                ticketVariants: ticketVariantsToCreate,
                qrCodeLink: mainQrCodeLink,
                paymentStatus: "pending",
                ticketStatus: "unused",
                ticketCount: totalTicketCount,
                totalAmount: totalAmount,
                paymentTransactionId: paymentDocumentCreation._id,
            };
            const createdTicket = yield this.ticketDatabase.createTicket(ticket);
            if (!createdTicket)
                throw new Error(`Error while creating ticket ${ticket.ticketId}`);
            // Update variant tickets sold count
            for (const [variantType, quantity] of selectedVariants) {
                console.log(`Updating variant ${variantType} sold count by ${quantity}`);
                yield this.eventDatabase.updateVariantTicketsSold(ticketData.eventId, variantType, quantity);
            }
            // Return all necessary data for payment confirmation
            return {
                createdTicket,
                clientSecret,
                paymentIntentId
            };
        });
    }
}
exports.CreateTicketUseCase = CreateTicketUseCase;
