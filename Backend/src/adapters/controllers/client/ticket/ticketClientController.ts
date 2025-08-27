import { Request, Response } from "express";
import { IcreateTicketUseCase } from "../../../../domain/interfaces/useCaseInterfaces/client/ticket/IcreateTicketUseCase";
import { HttpStatus } from "../../../../domain/entities/httpStatus";
import { IconfirmTicketAndPaymentUseCase } from "../../../../domain/interfaces/useCaseInterfaces/client/ticket/IconfirmTicketAndPayment";
import { IshowTicketAndEventClientUseCaseInterface } from "../../../../domain/interfaces/useCaseInterfaces/client/ticket/IshowEventsBookingUseCase";
import { ITicketCancelUseCase } from "../../../../domain/interfaces/useCaseInterfaces/client/ticket/IticketCancelUseCase";
import { IcheckTicketLimitUseCaseInterface } from "../../../../domain/interfaces/useCaseInterfaces/client/ticket/IcheckTicketLimitUseCaseInterface";
export class TicketClientController {
    private createTicketUseCase: IcreateTicketUseCase
    private confirmTicketAndPaymentUseCase: IconfirmTicketAndPaymentUseCase
    private showTickeAndEventUseCase:IshowTicketAndEventClientUseCaseInterface
    private ticketCancelUseCase:ITicketCancelUseCase
    private checkTicketLimitUseCase : IcheckTicketLimitUseCaseInterface
    constructor(createTicketUseCase: IcreateTicketUseCase,confirmTicketAndPaymentUseCase: IconfirmTicketAndPaymentUseCase,
        showTicketAndEventsUseCase:IshowTicketAndEventClientUseCaseInterface,ticketCancelUseCase:ITicketCancelUseCase,
        checkTicketLimitUseCase:IcheckTicketLimitUseCaseInterface
    ) {
        this.createTicketUseCase = createTicketUseCase
        this.confirmTicketAndPaymentUseCase=confirmTicketAndPaymentUseCase
        this.showTickeAndEventUseCase=showTicketAndEventsUseCase
        this.ticketCancelUseCase=ticketCancelUseCase
        this.checkTicketLimitUseCase=checkTicketLimitUseCase
    }
async handleCreateUseCase(req: Request, res: Response): Promise<void> {
        try {
            const { ticket, totalCount, totalAmount, paymentIntentId, vendorId } = req.body;

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

            if (!paymentIntentId || !vendorId) {
                res.status(HttpStatus.BAD_REQUEST).json({
                    message: "Missing paymentIntentId or vendorId"
                });
                return;
            }

            // Check ticket limits for each variant
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
            
            // Check if any variant exceeds the limit
            const failedChecks = limitCheckResults
                .map((result, index) => ({ result, variant: selectedVariants[index][0], requested: selectedVariants[index][1] }))
                .filter(({ result }) => !result.canBook);
            
            if (failedChecks.length > 0) {
                console.log("Ticket limit exceeded")
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

            const { stripeClientId, createdTickets } = await this.createTicketUseCase.createTicket(
                ticket,
                totalCount,
                totalAmount,
                paymentIntentId,
                vendorId
            );

            res.status(HttpStatus.CREATED).json({ 
                message: "Tickets and payment created and initiated successfully", 
                stripeClientId, 
                createdTickets,
                summary: {
                    totalTickets: createdTickets.length,
                    totalCount: totalCount,
                    totalAmount: totalAmount,
                    variants: createdTickets.map(ticket => ({
                        type: ticket.ticketVariant,
                        quantity: ticket.ticketCount,
                        amount: ticket.totalAmount
                    }))
                }
            });

        } catch (error) {
            res.status(HttpStatus.BAD_REQUEST).json({
                message: "Error while creating tickets",
                error: error instanceof Error ? error.message : "Unknown error occurred while creating tickets",
                timestamp: new Date().toISOString()
            });
        }
    }

    async handleConfirmTicketAndPayment(req: Request, res: Response): Promise<void> {
    try {
        const { ticket, tickets, paymentIntent, vendorId, totalTickets, allTickets } = req.body;

        
        let ticketsToConfirm = [];
        
        if (tickets && Array.isArray(tickets)) {
            ticketsToConfirm = tickets;
        } else if (allTickets && Array.isArray(allTickets)) {
            ticketsToConfirm = allTickets;
        } else if (ticket) {
            ticketsToConfirm = [ticket];
        } else {
            throw new Error('No ticket data provided');
        }

        console.log(`Processing ${ticketsToConfirm.length} tickets for confirmation`);

        if (!ticketsToConfirm.length) {
            throw new Error('No tickets to confirm');
        }

        const invalidTickets = ticketsToConfirm.filter(t => !t || !t.eventId);
        if (invalidTickets.length > 0) {
            throw new Error('Some tickets are missing required fields (eventId)');
        }

        const confirmTicketAndPayment = await this.confirmTicketAndPaymentUseCase.confirmTicketAndPayment(
            ticketsToConfirm, 
            paymentIntent, 
            vendorId
        );

        console.log(`Successfully confirmed ${confirmTicketAndPayment.length} tickets`);

        res.status(HttpStatus.OK).json({ 
            message: `${confirmTicketAndPayment.length} ticket(s) confirmed successfully`,
            confirmedTickets: confirmTicketAndPayment, 
            confirmTicketAndPayment: confirmTicketAndPayment[0] 
        });
    } catch (error) {
        console.log('error while confirming ticket and payment', error);
        res.status(HttpStatus.BAD_REQUEST).json({
            message: 'error while confirming ticket and payment',
            error: error instanceof Error ? error.message : 'error while confirming ticket and payment'
        });
    }
}
    async handleFetchTicketAndEventDetails(req: Request, res: Response): Promise<void> {
        try {
            const { userId, pageNo } = req.params
            console.log(userId)
            const page = parseInt(pageNo, 10) || 1
            const { ticketAndEventDetails, totalPages } = await this.showTickeAndEventUseCase.showTicketAndEvent(userId, page)
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
            const { ticketId } = req.body
            const cancelledTicket = await this.ticketCancelUseCase.ticketCancel(ticketId)
            res.status(HttpStatus.OK).json({ message: 'Ticket cancelled', cancelledTicket })
        } catch (error) {
            console.log('error while cancelling the ticket', error)
            res.status(HttpStatus.BAD_REQUEST).json({
                message: 'error while cancelling the ticket',
                error: error instanceof Error ? error.message : 'error while cancelling the ticket'
            })
        }
    }
}