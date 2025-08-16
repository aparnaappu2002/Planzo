import { Request, Response } from "express";
import { IcreateTicketUseCase } from "../../../../domain/interfaces/useCaseInterfaces/client/ticket/IcreateTicketUseCase";
import { HttpStatus } from "../../../../domain/entities/httpStatus";
import { IconfirmTicketAndPaymentUseCase } from "../../../../domain/interfaces/useCaseInterfaces/client/ticket/IconfirmTicketAndPayment";
import { IshowTicketAndEventClientUseCaseInterface } from "../../../../domain/interfaces/useCaseInterfaces/client/ticket/IshowEventsBookingUseCase";
import { ITicketCancelUseCase } from "../../../../domain/interfaces/useCaseInterfaces/client/ticket/IticketCancelUseCase";

export class TicketClientController {
    private createTicketUseCase: IcreateTicketUseCase
    private confirmTicketAndPaymentUseCase: IconfirmTicketAndPaymentUseCase
    private showTickeAndEventUseCase:IshowTicketAndEventClientUseCaseInterface
    private ticketCancelUseCase:ITicketCancelUseCase
    constructor(createTicketUseCase: IcreateTicketUseCase,confirmTicketAndPaymentUseCase: IconfirmTicketAndPaymentUseCase,
        showTicketAndEventsUseCase:IshowTicketAndEventClientUseCaseInterface,ticketCancelUseCase:ITicketCancelUseCase
    ) {
        this.createTicketUseCase = createTicketUseCase
        this.confirmTicketAndPaymentUseCase=confirmTicketAndPaymentUseCase
        this.showTickeAndEventUseCase=showTicketAndEventsUseCase
        this.ticketCancelUseCase=ticketCancelUseCase
    }
    async handleCreateUseCase(req: Request, res: Response): Promise<void> {
        try {
            const { ticket, totalCount, totalAmount, paymentIntentId, vendorId } = req.body
            console.log(req.body)
            const { stripeClientId, createdTicket } = await this.createTicketUseCase.createTicket(ticket, totalCount, totalAmount, paymentIntentId, vendorId)
            res.status(HttpStatus.CREATED).json({ message: "Ticket and payment created and initiated", stripeClientId, createdTicket })
        } catch (error) {
            console.log('error while creating ticket', error)
            res.status(HttpStatus.BAD_REQUEST).json({
                message: "error while creating ticket",
                error: error instanceof Error ? error.message : "error while creating ticket"
            })
        }
    }
    async handleConfirmTicketAndPayment(req: Request, res: Response): Promise<void> {
        try {
            const { ticket, paymentIntent, vendorId } = req.body

            const confirmTicketAndPayment = await this.confirmTicketAndPaymentUseCase.confirmTicketAndPayment(ticket, paymentIntent, vendorId)
  
            res.status(HttpStatus.OK).json({ message: "Ticket confirmed", confirmTicketAndPayment })
        } catch (error) {
            console.log('error while confirming ticket and payment', error)
            res.status(HttpStatus.BAD_REQUEST).json({
                message: 'error while confirming ticket and payment',
                error: error instanceof Error ? error.message : 'error while confirming ticket and payment'
            })
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