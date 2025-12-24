import { Request, Response } from "express";
import { IcreateTicketUseCase } from "../../../../domain/interfaces/useCaseInterfaces/client/ticket/IcreateTicketUseCase";
import { HttpStatus } from "../../../../domain/enums/httpStatus";
import { IconfirmTicketAndPaymentUseCase } from "../../../../domain/interfaces/useCaseInterfaces/client/ticket/IconfirmTicketAndPayment";
import { IshowTicketAndEventClientUseCaseInterface } from "../../../../domain/interfaces/useCaseInterfaces/client/ticket/IshowEventsBookingUseCase";
import { ITicketCancelUseCase } from "../../../../domain/interfaces/useCaseInterfaces/client/ticket/IticketCancelUseCase";
import { IcheckTicketLimitUseCaseInterface } from "../../../../domain/interfaces/useCaseInterfaces/client/ticket/IcheckTicketLimitUseCaseInterface";
import { IfindTicketsByStatus } from "../../../../domain/interfaces/useCaseInterfaces/client/ticket/IfindTicketBasedOnStatusUseCase";
export class TicketClientController {
    private createTicketUseCase: IcreateTicketUseCase
    private confirmTicketAndPaymentUseCase: IconfirmTicketAndPaymentUseCase
    private showTickeAndEventUseCase:IshowTicketAndEventClientUseCaseInterface
    private ticketCancelUseCase:ITicketCancelUseCase
    private findTicketsByStatusUseCase:IfindTicketsByStatus
    private checkTicketLimitUseCase : IcheckTicketLimitUseCaseInterface
    constructor(createTicketUseCase: IcreateTicketUseCase,confirmTicketAndPaymentUseCase: IconfirmTicketAndPaymentUseCase,
        showTicketAndEventsUseCase:IshowTicketAndEventClientUseCaseInterface,ticketCancelUseCase:ITicketCancelUseCase,
        checkTicketLimitUseCase:IcheckTicketLimitUseCaseInterface,findTicketsByStatusUseCase:IfindTicketsByStatus
    ) {
        this.createTicketUseCase = createTicketUseCase
        this.confirmTicketAndPaymentUseCase=confirmTicketAndPaymentUseCase
        this.showTickeAndEventUseCase=showTicketAndEventsUseCase
        this.ticketCancelUseCase=ticketCancelUseCase
        this.checkTicketLimitUseCase=checkTicketLimitUseCase
        this.findTicketsByStatusUseCase=findTicketsByStatusUseCase
    }
async handleCreateUseCase(req: Request, res: Response): Promise<void> {
    try {
        const { ticket, totalCount, totalAmount, vendorId } = req.body;

        // Validation
        if (!ticket) {
            res.status(HttpStatus.BAD_REQUEST).json({
                message: "Ticket data is required"
            });
            return;
        }

        if (!ticket.clientId || !ticket.email || !ticket.phone || !ticket.eventId) {
            res.status(HttpStatus.BAD_REQUEST).json({
                message: "Missing required ticket fields: clientId, email, phone, or eventId"
            });
            return;
        }

        if (!ticket.ticketVariants || typeof ticket.ticketVariants !== 'object') {
            res.status(HttpStatus.BAD_REQUEST).json({
                message: "Invalid ticketVariants format. Expected object with variant types as keys and quantities as values"
            });
            return;
        }

        const hasSelections = Object.values(ticket.ticketVariants).some((quantity: any) => 
            typeof quantity === 'number' && quantity > 0
        );

        if (!hasSelections) {
            res.status(HttpStatus.BAD_REQUEST).json({
                message: "No ticket variants selected"
            });
            return;
        }

        if (typeof totalCount !== 'number' || totalCount <= 0) {
            res.status(HttpStatus.BAD_REQUEST).json({
                message: "Invalid total count"
            });
            return;
        }

        if (typeof totalAmount !== 'number' || totalAmount < 0) {
            res.status(HttpStatus.BAD_REQUEST).json({
                message: "Invalid total amount"
            });
            return;
        }

        if (!vendorId) {
            res.status(HttpStatus.BAD_REQUEST).json({
                message: "Missing vendorId"
            });
            return;
        }

        // Get selected variants for limit checking
        const selectedVariants = Object.entries(ticket.ticketVariants)
            .filter(([variant, quantity]) => typeof quantity === 'number' && quantity > 0);

        // Check ticket limits before creation
        const limitCheckPromises = selectedVariants.map(([variant, quantity]) => 
            this.checkTicketLimitUseCase.checkTicketLimit(
                ticket.clientId,
                ticket.eventId,
                variant as 'standard' | 'premium' | 'vip',
                quantity as number
            )
        );

        const limitCheckResults = await Promise.all(limitCheckPromises);
        
        const failedChecks = limitCheckResults
            .map((result, index) => ({ 
                result, 
                variant: selectedVariants[index][0], 
                requested: selectedVariants[index][1] 
            }))
            .filter(({ result }) => !result.canBook);
        
        if (failedChecks.length > 0) {
            console.log("Ticket limit exceeded");
            res.status(HttpStatus.BAD_REQUEST).json({
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
                ticketCreationResult = await this.createTicketUseCase.createTicket(
                    ticket,
                    totalCount,
                    totalAmount,
                    vendorId
                );

                // If we reach here, ticket was created successfully
                break;

            } catch (error) {
                retryCount++;
                if (retryCount >= maxRetries) {
                    throw error;
                }
                
                // Exponential backoff: wait 100ms, then 200ms, then 400ms
                await new Promise(resolve => setTimeout(resolve, 100 * Math.pow(2, retryCount - 1)));
                console.log(`Retrying ticket creation, attempt ${retryCount + 1}`);
            }
        }

        if (!ticketCreationResult) {
            throw new Error('Failed to create ticket after multiple attempts');
        }
        console.log("TicketCreationResult:",ticketCreationResult)

        const { clientSecret, paymentIntentId, createdTicket } = ticketCreationResult;

        // Calculate summary from the consolidated ticket
        const variantsSummary = createdTicket.ticketVariants.map(variant => ({
            type: variant.variant,
            quantity: variant.count,
            pricePerTicket: variant.pricePerTicket,
            subtotal: variant.subtotal,
            qrCodesCount: variant.qrCodes.length
        }));

        const totalQRCodes = createdTicket.ticketVariants.reduce((sum, variant) => 
            sum + variant.qrCodes.length, 0
        );

        res.status(HttpStatus.CREATED).json({ 
            message: "Ticket and payment intent created successfully", 
            clientSecret,           // For Stripe payment confirmation on frontend
            paymentIntentId,        // For reference/tracking
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

    } catch (error) {
        console.error('Error in handleCreateUseCase:', error);
        res.status(HttpStatus.BAD_REQUEST).json({
            message: "Error while creating ticket",
            error: error instanceof Error ? error.message : "Unknown error occurred while creating ticket",
            timestamp: new Date().toISOString()
        });
    }
}

    async handleConfirmTicketAndPayment(req: Request, res: Response): Promise<void> {
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
            variants: ticket.ticketVariants.map((v: any) => ({ 
                variant: v.variant, 
                count: v.count, 
                subtotal: v.subtotal 
            })),
            totalAmount: ticket.totalAmount,
            totalCount: ticket.ticketCount
        });

        // Call the use case with the single consolidated ticket
        const confirmedTicket = await this.confirmTicketAndPaymentUseCase.confirmTicketAndPayment(
            ticket, 
            paymentIntent, 
            vendorId
        );

        console.log('Successfully confirmed consolidated ticket:', {
            ticketId: confirmedTicket.ticketId,
            paymentStatus: confirmedTicket.paymentStatus,
            ticketStatus: confirmedTicket.ticketStatus,
            variantCount: confirmedTicket.ticketVariants.length,
            totalQrCodes: confirmedTicket.ticketVariants.reduce((sum: number, v: any) => sum + v.qrCodes.length, 0)
        });

        res.status(HttpStatus.OK).json({ 
            message: 'Ticket confirmed successfully',
            confirmedTicket: confirmedTicket,
            ticketDetails: {
                ticketId: confirmedTicket.ticketId,
                totalAmount: confirmedTicket.totalAmount,
                totalTickets: confirmedTicket.ticketCount,
                variants: confirmedTicket.ticketVariants.map((v: any) => ({
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

    } catch (error) {
        console.error('Error while confirming ticket and payment:', error);
        res.status(HttpStatus.BAD_REQUEST).json({
            message: 'Error while confirming ticket and payment',
            error: error instanceof Error ? error.message : 'Unknown error occurred during ticket confirmation'
        });
    }
}
    async handleFetchTicketAndEventDetails(req: Request, res: Response): Promise<void> {
        try {
            const { clientId, pageNo } = req.params
            
            const page = parseInt(pageNo, 10) || 1
            const { ticketAndEventDetails, totalPages } = await this.showTickeAndEventUseCase.showTicketAndEvent(clientId, page)
            res.status(HttpStatus.OK).json({ message: "Ticket details fetched", ticketAndEventDetails, totalPages })
        } catch (error) {
            console.log('error while fetching ticketDetails with event details', error)
            res.status(HttpStatus.BAD_REQUEST).json({
                message: 'error while fetching ticketDetails with event details',
                error: error instanceof Error ? error.message : 'error while fetching ticketDetails with event details'
            })
        }
    }
    async handleTicketCancel(req: Request, res: Response): Promise<void> {
    try {
        const { ticketId, refundMethod } = req.body
        
        // Validate refundMethod
        if (refundMethod && !['wallet', 'bank'].includes(refundMethod)) {
            res.status(HttpStatus.BAD_REQUEST).json({
                message: 'Invalid refund method. Must be either "wallet" or "bank"'
            })
            return
        }
        
        const cancelledTicket = await this.ticketCancelUseCase.ticketCancel(
            ticketId, 
            refundMethod || 'wallet' // Default to wallet if not specified
        )
        
        res.status(HttpStatus.OK).json({ 
            message: 'Ticket cancelled successfully', 
            cancelledTicket,
            refundMethod: refundMethod || 'wallet'
        })
    } catch (error) {
        console.log('error while cancelling the ticket', error)
        res.status(HttpStatus.BAD_REQUEST).json({
            message: 'Error while cancelling the ticket',
            error: error instanceof Error ? error.message : 'Error while cancelling the ticket'
        })
    }
}
    async handleFindTicketsByStatus(req: Request, res: Response): Promise<void> {
    try {
        const { ticketStatus, paymentStatus, pageNo, sortBy } = req.params;
        
        const result = await this.findTicketsByStatusUseCase.findTicketsByStatus(
            ticketStatus as 'used' | 'refunded' | 'unused',
            paymentStatus as 'pending' | 'successful' | 'failed' | 'refunded',
            Number(pageNo),
            sortBy
        );
        
        res.status(HttpStatus.OK).json({ message: 'Tickets retrieved successfully', data: result });
        
    } catch (error) {
        console.log('Error while finding tickets by status', error);
        res.status(HttpStatus.BAD_REQUEST).json({
            message: 'Error while finding tickets by status',
            error: error instanceof Error ? error.message : 'Error while finding tickets by status'
        });
    }
}

}