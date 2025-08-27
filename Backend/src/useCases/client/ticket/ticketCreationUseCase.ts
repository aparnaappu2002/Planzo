import { PaymentEntity } from "../../../domain/entities/payment/paymentEntity";
import { TicketEntity } from "../../../domain/entities/ticket/ticketEntity";
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
    ): Promise<{ createdTickets: TicketEntity[], stripeClientId: string }> {
        
        

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

        const ticketsToCreate: TicketEntity[] = [];
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
            const variantTotalAmount = selectedVariant.price * quantity;
            calculatedAmount += variantTotalAmount;
            totalTicketCount += quantity;

            // CREATE INDIVIDUAL TICKETS FOR EACH QUANTITY
            // Instead of creating one ticket with ticketCount, create separate ticket entities
            for (let i = 0; i < quantity; i++) {
                // Generate unique ticket ID for each individual ticket
                const ticketId = generateRandomUuid();
                if (!ticketId) throw new Error('Error while creating ticket ID');

                const hostName = process.env.HOSTNAME;
                if (!hostName) throw new Error("No hostname found");

                // Create unique QR code link for each ticket
                const qrLink = `${hostName}/verifyTicket/${ticketId}/${ticketData.eventId}`;
                const qrCodeLink = await this.genQr.createQrLink(qrLink);
                if (!qrCodeLink) throw new Error('Error while creating QR code link');

                // Create individual ticket entity
                const ticket: TicketEntity = {
                    clientId: ticketData.clientId,
                    email: ticketData.email,
                    phone: ticketData.phone,
                    eventId: ticketData.eventId,
                    ticketId: ticketId, // Unique ID for each ticket
                    ticketVariant: variantType,
                    qrCodeLink: qrCodeLink, // Unique QR code for each ticket
                    paymentStatus: "pending",
                    ticketStatus: "unused",
                    ticketCount: 1, // Each ticket entity represents 1 ticket
                    totalAmount: selectedVariant.price, // Price for 1 ticket of this variant
                    paymentTransactionId: '', // Will be updated after payment creation
                };

                ticketsToCreate.push(ticket);
                console.log(`Created individual ticket entity ${i + 1}/${quantity} for ${variantType}:`, {
                    ticketId: ticket.ticketId,
                    variant: ticket.ticketVariant,
                    price: ticket.totalAmount
                });
            }

            console.log(`Completed processing ${quantity} ${variantType} tickets`);
        }

        console.log('=== VALIDATION ===');
        console.log(`Calculated amount: ${calculatedAmount}, Received amount: ${totalAmount}`);
        console.log(`Calculated count: ${totalTicketCount}, Received count: ${totalCount}`);
        console.log(`Total tickets to create: ${ticketsToCreate.length}`);
        console.log('==================');

        // Validate total amount (allow small floating point differences)
        if (Math.abs(totalAmount - calculatedAmount) > 0.01) {
            throw new Error(`Price mismatch. Expected: ₹${calculatedAmount.toFixed(2)}, Received: ₹${totalAmount.toFixed(2)}`);
        }

        // Validate total count
        if (totalCount !== totalTicketCount) {
            throw new Error(`Ticket count mismatch. Expected: ${totalTicketCount}, Received: ${totalCount}`);
        }

        // Validate that we created the right number of tickets
        if (ticketsToCreate.length !== totalCount) {
            throw new Error(`Ticket creation count mismatch. Expected to create: ${totalCount}, Actually created: ${ticketsToCreate.length}`);
        }

        if (ticketsToCreate.length === 0) {
            throw new Error('No tickets to create');
        }

        // Create Stripe payment intent
        const clientStripeId = await this.stripe.createPaymentIntent(totalAmount, 'ticket', { 
            tickets: ticketsToCreate.map(ticket => ({
                ticketId: ticket.ticketId,
                variant: ticket.ticketVariant,
                amount: ticket.totalAmount
            })),
            totalTickets: ticketsToCreate.length,
            eventId: ticketData.eventId,
            clientId: ticketData.clientId
        });
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
            ticketId: ticketsToCreate[0].ticketId, // Primary ticket ID for reference
        };

        const paymentDocumentCreation = await this.paymentDatabase.createPayment(paymentDetails);
        if (!paymentDocumentCreation) throw new Error('Error while creating payment document');

        // Update all tickets with payment transaction ID
        ticketsToCreate.forEach(ticket => {
            ticket.paymentTransactionId = paymentDocumentCreation._id!;
        });

        // Create all individual tickets in database
        const createdTickets: TicketEntity[] = [];
        for (const ticket of ticketsToCreate) {
            console.log(`Creating individual ticket in database:`, {
                ticketId: ticket.ticketId,
                variant: ticket.ticketVariant,
                amount: ticket.totalAmount
            });
            
            const createdTicket = await this.ticketDatabase.createTicket(ticket);
            if (!createdTicket) throw new Error(`Error while creating ticket ${ticket.ticketId}`);
            
            createdTickets.push(createdTicket);
        }

        // Update event's ticket variants sold count (aggregate by variant type)
        const variantUpdates: { [key: string]: number } = {};
        for (const [variantType, quantity] of selectedVariants) {
            variantUpdates[variantType] = quantity;
        }

        for (const [variantType, quantity] of Object.entries(variantUpdates)) {
            console.log(`Updating variant ${variantType} sold count by ${quantity}`);
            await this.eventDatabase.updateVariantTicketsSold(ticketData.eventId, variantType, quantity);
        }

        console.log('=== FINAL RESULT ===');
        console.log(`Created ${createdTickets.length} individual tickets`);
        console.log('Tickets breakdown:', createdTickets.map(t => ({
            ticketId: t.ticketId,
            variant: t.ticketVariant,
            amount: t.totalAmount
        })));
        console.log('Stripe client ID:', clientStripeId);
        console.log('====================');

        return { createdTickets, stripeClientId: clientStripeId };
    }
}