import { Request, Response } from "express";
import { IcreateTicketUseCase } from "../../../../domain/interfaces/useCaseInterfaces/client/ticket/IcreateTicketUseCase";
import { HttpStatus } from "../../../../domain/entities/httpStatus";
import { IconfirmTicketAndPaymentUseCase } from "../../../../domain/interfaces/useCaseInterfaces/client/ticket/IconfirmTicketAndPayment";

export class TicketClientController {
    private createTicketUseCase: IcreateTicketUseCase
    private confirmTicketAndPaymentUseCase: IconfirmTicketAndPaymentUseCase
    constructor(createTicketUseCase: IcreateTicketUseCase,confirmTicketAndPaymentUseCase: IconfirmTicketAndPaymentUseCase) {
        this.createTicketUseCase = createTicketUseCase
        this.confirmTicketAndPaymentUseCase=confirmTicketAndPaymentUseCase
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
}