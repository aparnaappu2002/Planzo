import { Request, Response } from "express";
import { IcreateTicketUseCase } from "../../../../domain/interfaces/useCaseInterfaces/client/ticket/IcreateTicketUseCase";
import { HttpStatus } from "../../../../domain/enums/httpStatus";
import { IconfirmTicketAndPaymentUseCase } from "../../../../domain/interfaces/useCaseInterfaces/client/ticket/IconfirmTicketAndPayment";
import { IshowTicketAndEventClientUseCaseInterface } from "../../../../domain/interfaces/useCaseInterfaces/client/ticket/IshowEventsBookingUseCase";
import { ITicketCancelUseCase } from "../../../../domain/interfaces/useCaseInterfaces/client/ticket/IticketCancelUseCase";
import { IcheckTicketLimitUseCaseInterface } from "../../../../domain/interfaces/useCaseInterfaces/client/ticket/IcheckTicketLimitUseCaseInterface";
import { IfindTicketsByStatus } from "../../../../domain/interfaces/useCaseInterfaces/client/ticket/IfindTicketBasedOnStatusUseCase";
import { handleErrorResponse,logInfo,logError } from "../../../../framework/services/errorHandler";
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

        const hasSelections = Object.values(ticket.ticketVariants).some((quantity: unknown) => 
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

        const selectedVariants = Object.entries(ticket.ticketVariants)
            .filter(([variant, quantity]) => typeof quantity === 'number' && quantity > 0);

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

        let retryCount = 0;
        const maxRetries = 3;
        let ticketCreationResult;

        while (retryCount < maxRetries) {
            try {
                ticketCreationResult = await this.createTicketUseCase.createTicket(
                    ticket,
                    totalCount,
                    totalAmount,
                    vendorId
                );

                break;

            } catch (error) {
                retryCount++;
                if (retryCount >= maxRetries) {
                    throw error;
                }
                
                await new Promise(resolve => setTimeout(resolve, 100 * Math.pow(2, retryCount - 1)));
                console.log(`Retrying ticket creation, attempt ${retryCount + 1}`);
            }
        }

        if (!ticketCreationResult) {
            throw new Error('Failed to create ticket after multiple attempts');
        }

        const { clientSecret, paymentIntentId, createdTicket } = ticketCreationResult;
        logInfo('Ticket created successfully', {
                ticketId: createdTicket.ticketId,
                paymentIntentId,
                totalAmount: createdTicket.totalAmount,
                totalTickets: createdTicket.ticketCount
            });


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
            clientSecret,           
            paymentIntentId,        
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
        logError('Error in handleCreateUseCase:', error);
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

        

        if (!ticket) {
            throw new Error('No ticket data provided');
        }

        if (!paymentIntent) {
            throw new Error('Payment intent is required');
        }

        if (!vendorId) {
            throw new Error('Vendor ID is required');
        }

        if (!ticket.eventId) {
            throw new Error('Ticket is missing required eventId field');
        }

        if (!ticket.ticketVariants || !Array.isArray(ticket.ticketVariants) || ticket.ticketVariants.length === 0) {
            throw new Error('Ticket must contain valid ticket variants');
        }

        if (!ticket.ticketId) {
            throw new Error('Ticket is missing required ticketId field');
        }

        

        const confirmedTicket = await this.confirmTicketAndPaymentUseCase.confirmTicketAndPayment(
            ticket, 
            paymentIntent, 
            vendorId
        );

        
        logInfo('Ticket confirmed successfully', {
                ticketId: confirmedTicket.ticketId,
                paymentStatus: confirmedTicket.paymentStatus,
                ticketStatus: confirmedTicket.ticketStatus,
                totalAmount: confirmedTicket.totalAmount
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
        logError('Error while confirming ticket and payment:', error);
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
            logInfo('Ticket and event details fetched successfully', { 
                clientId, 
                page, 
                totalPages,
                ticketsCount: ticketAndEventDetails.length 
            });

            res.status(HttpStatus.OK).json({ message: "Ticket details fetched", ticketAndEventDetails, totalPages })
        } catch (error) {
            logError('Error while fetching ticket details with event details', error);
            handleErrorResponse(req, res, error, 'Error while fetching ticket details with event details');

        }
    }
    async handleTicketCancel(req: Request, res: Response): Promise<void> {
    try {
        const { ticketId, refundMethod } = req.body
        
        if (refundMethod && !['wallet', 'bank'].includes(refundMethod)) {
            res.status(HttpStatus.BAD_REQUEST).json({
                message: 'Invalid refund method. Must be either "wallet" or "bank"'
            })
            return
        }
        
        const cancelledTicket = await this.ticketCancelUseCase.ticketCancel(
            ticketId, 
            refundMethod || 'wallet' 
        )
        
        
        res.status(HttpStatus.OK).json({ 
            message: 'Ticket cancelled successfully', 
            cancelledTicket,
            refundMethod: refundMethod || 'wallet'
        })
    } catch (error) {
        logError('Error while cancelling the ticket', error);
            handleErrorResponse(req, res, error, 'Error while cancelling the ticket');

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
        logError('Error while finding tickets by status', error);
        handleErrorResponse(req, res, error, 'Error while finding tickets by status');

    }
}

}