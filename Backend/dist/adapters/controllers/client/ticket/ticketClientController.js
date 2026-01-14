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
exports.TicketClientController = void 0;
const httpStatus_1 = require("../../../../domain/enums/httpStatus");
class TicketClientController {
    constructor(createTicketUseCase, confirmTicketAndPaymentUseCase, showTicketAndEventsUseCase, ticketCancelUseCase, checkTicketLimitUseCase, findTicketsByStatusUseCase) {
        this.createTicketUseCase = createTicketUseCase;
        this.confirmTicketAndPaymentUseCase = confirmTicketAndPaymentUseCase;
        this.showTickeAndEventUseCase = showTicketAndEventsUseCase;
        this.ticketCancelUseCase = ticketCancelUseCase;
        this.checkTicketLimitUseCase = checkTicketLimitUseCase;
        this.findTicketsByStatusUseCase = findTicketsByStatusUseCase;
    }
    handleCreateUseCase(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { ticket, totalCount, totalAmount, vendorId } = req.body;
                // Validation
                if (!ticket) {
                    res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({
                        message: "Ticket data is required"
                    });
                    return;
                }
                if (!ticket.clientId || !ticket.email || !ticket.phone || !ticket.eventId) {
                    res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({
                        message: "Missing required ticket fields: clientId, email, phone, or eventId"
                    });
                    return;
                }
                if (!ticket.ticketVariants || typeof ticket.ticketVariants !== 'object') {
                    res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({
                        message: "Invalid ticketVariants format. Expected object with variant types as keys and quantities as values"
                    });
                    return;
                }
                const hasSelections = Object.values(ticket.ticketVariants).some((quantity) => typeof quantity === 'number' && quantity > 0);
                if (!hasSelections) {
                    res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({
                        message: "No ticket variants selected"
                    });
                    return;
                }
                if (typeof totalCount !== 'number' || totalCount <= 0) {
                    res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({
                        message: "Invalid total count"
                    });
                    return;
                }
                if (typeof totalAmount !== 'number' || totalAmount < 0) {
                    res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({
                        message: "Invalid total amount"
                    });
                    return;
                }
                if (!vendorId) {
                    res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({
                        message: "Missing vendorId"
                    });
                    return;
                }
                // Get selected variants for limit checking
                const selectedVariants = Object.entries(ticket.ticketVariants)
                    .filter(([variant, quantity]) => typeof quantity === 'number' && quantity > 0);
                // Check ticket limits before creation
                const limitCheckPromises = selectedVariants.map(([variant, quantity]) => this.checkTicketLimitUseCase.checkTicketLimit(ticket.clientId, ticket.eventId, variant, quantity));
                const limitCheckResults = yield Promise.all(limitCheckPromises);
                const failedChecks = limitCheckResults
                    .map((result, index) => ({
                    result,
                    variant: selectedVariants[index][0],
                    requested: selectedVariants[index][1]
                }))
                    .filter(({ result }) => !result.canBook);
                if (failedChecks.length > 0) {
                    console.log("Ticket limit exceeded");
                    res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({
                        message: "Ticket booking limit exceeded",
                        details: failedChecks.map(({ result, variant, requested }) => ({
                            variant,
                            maxPerUser: result.maxPerUser,
                            remainingLimit: result.remainingLimit,
                            requested
                        }))
                    });
                    return;
                }
                // Create ticket with retry mechanism
                let retryCount = 0;
                const maxRetries = 3;
                let ticketCreationResult;
                while (retryCount < maxRetries) {
                    try {
                        // Create ticket - this now creates the payment intent internally
                        ticketCreationResult = yield this.createTicketUseCase.createTicket(ticket, totalCount, totalAmount, vendorId);
                        // If we reach here, ticket was created successfully
                        break;
                    }
                    catch (error) {
                        retryCount++;
                        if (retryCount >= maxRetries) {
                            throw error;
                        }
                        // Exponential backoff: wait 100ms, then 200ms, then 400ms
                        yield new Promise(resolve => setTimeout(resolve, 100 * Math.pow(2, retryCount - 1)));
                        console.log(`Retrying ticket creation, attempt ${retryCount + 1}`);
                    }
                }
                if (!ticketCreationResult) {
                    throw new Error('Failed to create ticket after multiple attempts');
                }
                console.log("TicketCreationResult:", ticketCreationResult);
                const { clientSecret, paymentIntentId, createdTicket } = ticketCreationResult;
                // Calculate summary from the consolidated ticket
                const variantsSummary = createdTicket.ticketVariants.map(variant => ({
                    type: variant.variant,
                    quantity: variant.count,
                    pricePerTicket: variant.pricePerTicket,
                    subtotal: variant.subtotal,
                    qrCodesCount: variant.qrCodes.length
                }));
                const totalQRCodes = createdTicket.ticketVariants.reduce((sum, variant) => sum + variant.qrCodes.length, 0);
                res.status(httpStatus_1.HttpStatus.CREATED).json({
                    message: "Ticket and payment intent created successfully",
                    clientSecret, // For Stripe payment confirmation on frontend
                    paymentIntentId, // For reference/tracking
                    createdTicket,
                    summary: {
                        ticketId: createdTicket.ticketId,
                        totalVariants: createdTicket.ticketVariants.length,
                        totalTickets: createdTicket.ticketCount,
                        totalQRCodes: totalQRCodes,
                        totalAmount: createdTicket.totalAmount,
                        variants: variantsSummary,
                        paymentStatus: createdTicket.paymentStatus,
                        ticketStatus: createdTicket.ticketStatus
                    }
                });
            }
            catch (error) {
                console.error('Error in handleCreateUseCase:', error);
                res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({
                    message: "Error while creating ticket",
                    error: error instanceof Error ? error.message : "Unknown error occurred while creating ticket",
                    timestamp: new Date().toISOString()
                });
            }
        });
    }
    handleConfirmTicketAndPayment(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { ticket, paymentIntent, vendorId } = req.body;
                // Validate required fields
                if (!ticket) {
                    throw new Error('No ticket data provided');
                }
                if (!paymentIntent) {
                    throw new Error('Payment intent is required');
                }
                if (!vendorId) {
                    throw new Error('Vendor ID is required');
                }
                // Validate ticket structure
                if (!ticket.eventId) {
                    throw new Error('Ticket is missing required eventId field');
                }
                if (!ticket.ticketVariants || !Array.isArray(ticket.ticketVariants) || ticket.ticketVariants.length === 0) {
                    throw new Error('Ticket must contain valid ticket variants');
                }
                if (!ticket.ticketId) {
                    throw new Error('Ticket is missing required ticketId field');
                }
                console.log('Processing consolidated ticket for confirmation:', {
                    ticketId: ticket.ticketId,
                    eventId: ticket.eventId,
                    variants: ticket.ticketVariants.map((v) => ({
                        variant: v.variant,
                        count: v.count,
                        subtotal: v.subtotal
                    })),
                    totalAmount: ticket.totalAmount,
                    totalCount: ticket.ticketCount
                });
                // Call the use case with the single consolidated ticket
                const confirmedTicket = yield this.confirmTicketAndPaymentUseCase.confirmTicketAndPayment(ticket, paymentIntent, vendorId);
                console.log('Successfully confirmed consolidated ticket:', {
                    ticketId: confirmedTicket.ticketId,
                    paymentStatus: confirmedTicket.paymentStatus,
                    ticketStatus: confirmedTicket.ticketStatus,
                    variantCount: confirmedTicket.ticketVariants.length,
                    totalQrCodes: confirmedTicket.ticketVariants.reduce((sum, v) => sum + v.qrCodes.length, 0)
                });
                res.status(httpStatus_1.HttpStatus.OK).json({
                    message: 'Ticket confirmed successfully',
                    confirmedTicket: confirmedTicket,
                    ticketDetails: {
                        ticketId: confirmedTicket.ticketId,
                        totalAmount: confirmedTicket.totalAmount,
                        totalTickets: confirmedTicket.ticketCount,
                        variants: confirmedTicket.ticketVariants.map((v) => ({
                            type: v.variant,
                            count: v.count,
                            subtotal: v.subtotal,
                            qrCodes: v.qrCodes.length
                        })),
                        paymentStatus: confirmedTicket.paymentStatus,
                        ticketStatus: confirmedTicket.ticketStatus
                    }
                });
                console.log('=== CONTROLLER: CONFIRMATION COMPLETED ===');
            }
            catch (error) {
                console.error('Error while confirming ticket and payment:', error);
                res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({
                    message: 'Error while confirming ticket and payment',
                    error: error instanceof Error ? error.message : 'Unknown error occurred during ticket confirmation'
                });
            }
        });
    }
    handleFetchTicketAndEventDetails(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { clientId, pageNo } = req.params;
                const page = parseInt(pageNo, 10) || 1;
                const { ticketAndEventDetails, totalPages } = yield this.showTickeAndEventUseCase.showTicketAndEvent(clientId, page);
                res.status(httpStatus_1.HttpStatus.OK).json({ message: "Ticket details fetched", ticketAndEventDetails, totalPages });
            }
            catch (error) {
                console.log('error while fetching ticketDetails with event details', error);
                res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({
                    message: 'error while fetching ticketDetails with event details',
                    error: error instanceof Error ? error.message : 'error while fetching ticketDetails with event details'
                });
            }
        });
    }
    handleTicketCancel(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { ticketId, refundMethod } = req.body;
                // Validate refundMethod
                if (refundMethod && !['wallet', 'bank'].includes(refundMethod)) {
                    res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({
                        message: 'Invalid refund method. Must be either "wallet" or "bank"'
                    });
                    return;
                }
                const cancelledTicket = yield this.ticketCancelUseCase.ticketCancel(ticketId, refundMethod || 'wallet' // Default to wallet if not specified
                );
                res.status(httpStatus_1.HttpStatus.OK).json({
                    message: 'Ticket cancelled successfully',
                    cancelledTicket,
                    refundMethod: refundMethod || 'wallet'
                });
            }
            catch (error) {
                console.log('error while cancelling the ticket', error);
                res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({
                    message: 'Error while cancelling the ticket',
                    error: error instanceof Error ? error.message : 'Error while cancelling the ticket'
                });
            }
        });
    }
    handleFindTicketsByStatus(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { ticketStatus, paymentStatus, pageNo, sortBy } = req.params;
                const result = yield this.findTicketsByStatusUseCase.findTicketsByStatus(ticketStatus, paymentStatus, Number(pageNo), sortBy);
                res.status(httpStatus_1.HttpStatus.OK).json({ message: 'Tickets retrieved successfully', data: result });
            }
            catch (error) {
                console.log('Error while finding tickets by status', error);
                res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({
                    message: 'Error while finding tickets by status',
                    error: error instanceof Error ? error.message : 'Error while finding tickets by status'
                });
            }
        });
    }
}
exports.TicketClientController = TicketClientController;
