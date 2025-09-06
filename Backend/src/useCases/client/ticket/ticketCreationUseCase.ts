import { PaymentEntity } from "../../../domain/entities/payment/paymentEntity";
import { TicketEntity } from "../../../domain/entities/ticket/ticketEntity";
import { TicketVariant } from "../../../domain/entities/ticket/ticketVariantEntity";
import { TicketFromFrontend } from "../../../domain/entities/ticket/ticketFromFrontend";
import { IeventRepository } from "../../../domain/interfaces/repositoryInterfaces/event/IeventRepository";
import { IticketRepositoryInterface } from "../../../domain/interfaces/repositoryInterfaces/ticket/IticketRepository";
import { IpaymentRepository } from "../../../domain/interfaces/repositoryInterfaces/payment/IpaymentRepository";
import { IStripeService } from "../../../domain/interfaces/serviceInterface/IstripeService";
import { IqrServiceInterface } from "../../../domain/interfaces/serviceInterface/IqrService";
import { IcreateTicketUseCase } from "../../../domain/interfaces/useCaseInterfaces/client/ticket/IcreateTicketUseCase";
import { generateRandomUuid } from "../../../framework/services/randomUuid";

export class CreateTicketUseCase implements IcreateTicketUseCase {
    private eventDatabase: IeventRepository
    private ticketDatabase: IticketRepositoryInterface
    private stripe: IStripeService
    private genQr: IqrServiceInterface
    private paymentDatabase: IpaymentRepository
    
    constructor(
        eventDatabase: IeventRepository, 
        ticketDatabase: IticketRepositoryInterface, 
        stripe: IStripeService, 
        genQr: IqrServiceInterface, 
        paymentDatabase: IpaymentRepository
    ) {
        this.ticketDatabase = ticketDatabase
        this.stripe = stripe
        this.genQr = genQr
        this.paymentDatabase = paymentDatabase
        this.eventDatabase = eventDatabase
    }

    async createTicket(
        ticketData: TicketFromFrontend,
        totalCount: number, 
        totalAmount: number, 
        paymentIntentId: string, 
        vendorId: string
    ): Promise<{ createdTicket: TicketEntity, stripeClientId: string }> {
        
        // Validate input data
        if (!ticketData.ticketVariants || typeof ticketData.ticketVariants !== 'object') {
            throw new Error('Invalid ticket variants data structure');
        }

        // Filter out zero quantities and validate we have selections
        const selectedVariants = Object.entries(ticketData.ticketVariants)
            .filter(([variantType, quantity]) => quantity > 0);

        if (selectedVariants.length === 0) {
            throw new Error('No ticket variants selected');
        }

        // Validate variant types
        const validVariants: ('standard' | 'premium' | 'vip')[] = ['standard', 'premium', 'vip'];
        for (const [variantType] of selectedVariants) {
            if (!validVariants.includes(variantType as any)) {
                throw new Error(`Invalid variant type: ${variantType}. Valid types are: ${validVariants.join(', ')}`);
            }
        }

        // Get event details with ticket variants
        const eventDetails = await this.eventDatabase.findTotalTicketAndBookedTicket(ticketData.eventId);
        console.log('Event Details:', JSON.stringify(eventDetails, null, 2));
        
        if (!eventDetails) throw new Error('No event found with this ID');
        
        // Check event status
        if (eventDetails.status === "completed") throw new Error("This event is already completed");
        if (eventDetails.status === 'cancelled') throw new Error("This event is already cancelled");
        
        if (!eventDetails.ticketVariants || eventDetails.ticketVariants.length === 0) {
            throw new Error('No ticket variants available for this event');
        }

        const ticketVariantsToCreate: TicketVariant[] = [];
        let calculatedAmount = 0;
        let totalTicketCount = 0;

        // Process each selected variant
        for (const [variantType, quantity] of selectedVariants) {
            console.log(`Processing variant: ${variantType}, quantity: ${quantity}`);

            // Find the variant by type (case insensitive comparison)
            const selectedVariant = eventDetails.ticketVariants.find(variant => 
                variant.type.toLowerCase() === variantType.toLowerCase()
            );

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
                const qrId = `${variantType}_${generateRandomUuid()}_${i + 1}`;
                const hostName = process.env.HOSTNAME;
                if (!hostName) throw new Error("No hostname found");

                const qrLink = `${hostName}/verifyTicket/${qrId}/${ticketData.eventId}`;
                const qrCodeLink = await this.genQr.createQrLink(qrLink);
                if (!qrCodeLink) throw new Error('Error while creating QR code link');

                qrCodes.push({
                    qrId: qrId,
                    qrCodeLink: qrCodeLink,
                    status: 'unused' as 'used' | 'unused' | 'refunded',
                    checkInHistory: []
                });
            }

            // Add variant to ticket with proper type casting
            ticketVariantsToCreate.push({
                variant: variantType as 'standard' | 'premium' | 'vip',
                count: quantity,
                pricePerTicket: selectedVariant.price,
                subtotal: variantSubtotal,
                qrCodes: qrCodes
            });

            console.log(`Completed processing ${quantity} ${variantType} tickets with ${qrCodes.length} QR codes`);
        }

        console.log('=== VALIDATION ===');
        console.log(`Calculated amount: ${calculatedAmount}, Received amount: ${totalAmount}`);
        console.log(`Calculated count: ${totalTicketCount}, Received count: ${totalCount}`);
        console.log(`Total ticket variants: ${ticketVariantsToCreate.length}`);
        console.log('==================');

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
        const mainTicketId = generateRandomUuid();
        if (!mainTicketId) throw new Error('Error while creating ticket ID');

        // Create a single main QR code for the ticket (optional, since variants have their own QR codes)
        const hostName = process.env.HOSTNAME;
        if (!hostName) throw new Error("No hostname found");
        const mainQrLink = `${hostName}/verifyTicket/${mainTicketId}/${ticketData.eventId}`;
        const mainQrCodeLink = await this.genQr.createQrLink(mainQrLink);
        if (!mainQrCodeLink) throw new Error('Error while creating main QR code link');

        // Create Stripe payment intent with simplified metadata
        const stripeMetadata = {
            ticketId: mainTicketId,
            eventId: ticketData.eventId,
            clientId: ticketData.clientId,
            totalTickets: totalTicketCount,
            totalAmount: totalAmount
        };

        const clientStripeId = await this.stripe.createPaymentIntent(totalAmount, 'ticket', stripeMetadata);
        if (!clientStripeId) throw new Error("Error while creating Stripe client ID");

        // Create payment document
        const paymentDetails: PaymentEntity = {
            amount: totalAmount,
            currency: 'inr',
            paymentId: paymentIntentId,
            receiverId: vendorId,
            purpose: 'ticketBooking',
            status: "pending",
            userId: ticketData.clientId,
            ticketId: mainTicketId,
        };

        const paymentDocumentCreation = await this.paymentDatabase.createPayment(paymentDetails);
        if (!paymentDocumentCreation) throw new Error('Error while creating payment document');

        // Create single ticket entity with multiple variants
        const ticket: TicketEntity = {
            clientId: ticketData.clientId,
            email: ticketData.email,
            phone: ticketData.phone,
            eventId: ticketData.eventId,
            ticketId: mainTicketId,
            ticketVariants: ticketVariantsToCreate,
            qrCodeLink: mainQrCodeLink, // Main QR code (optional)
            paymentStatus: "pending",
            ticketStatus: "unused",
            ticketCount: totalTicketCount,
            totalAmount: totalAmount,
            paymentTransactionId: paymentDocumentCreation._id!,
        };

        console.log(`Creating consolidated ticket in database:`, {
            ticketId: ticket.ticketId,
            variants: ticket.ticketVariants.map(v => ({ variant: v.variant, count: v.count, subtotal: v.subtotal })),
            totalAmount: ticket.totalAmount,
            totalCount: ticket.ticketCount
        });
        
        const createdTicket = await this.ticketDatabase.createTicket(ticket);
        if (!createdTicket) throw new Error(`Error while creating ticket ${ticket.ticketId}`);

        // Update event's ticket variants sold count
        for (const [variantType, quantity] of selectedVariants) {
            console.log(`Updating variant ${variantType} sold count by ${quantity}`);
            await this.eventDatabase.updateVariantTicketsSold(ticketData.eventId, variantType, quantity);
        }

        console.log('=== FINAL RESULT ===');
        console.log(`Created consolidated ticket with ID: ${createdTicket.ticketId}`);
        console.log('Variants breakdown:', createdTicket.ticketVariants.map(v => ({
            variant: v.variant,
            count: v.count,
            subtotal: v.subtotal,
            qrCodesCount: v.qrCodes.length
        })));
        console.log('Stripe client ID:', clientStripeId);
        console.log('====================');

        return { createdTicket, stripeClientId: clientStripeId };
    }
}