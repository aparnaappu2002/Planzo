import { Request, Response } from "express";
import { IticketAndUserDetailsOfEventUseCase } from "../../../../domain/interfaces/useCaseInterfaces/vendor/ticket/ticketAndUserDetailsOfEventUseCase";
import { HttpStatus } from "../../../../domain/enums/httpStatus";
import { IticketVerificationUseCase } from "../../../../domain/interfaces/useCaseInterfaces/vendor/ticket/IticketVerificationUseCase";

export class TicketVendorController {
    private ticketAndUserDetailsUseCase: IticketAndUserDetailsOfEventUseCase
    private ticketVerificationUseCase:IticketVerificationUseCase
    constructor(ticketAndUserDetailsUseCase: IticketAndUserDetailsOfEventUseCase,ticketVerificationUseCase:IticketVerificationUseCase) {
        this.ticketAndUserDetailsUseCase = ticketAndUserDetailsUseCase
        this.ticketVerificationUseCase=ticketVerificationUseCase
    }
    async handleTicketAndUserDetails(req: Request, res: Response): Promise<void> {
        try {
            const {vendorId, pageNo } = req.query
            const page = parseInt(pageNo as string, 10) || 1
            if (!vendorId) {
                res.status(HttpStatus.BAD_REQUEST).json({ message: 'vendor id is missing' })
                return
            }
            const { ticketAndEventDetails, totalPages } = await this.ticketAndUserDetailsUseCase.findTicketAndUserDetailsOfEvent(vendorId?.toString(), page)
            res.status(HttpStatus.OK).json({ message: "Ticket and user details", ticketAndEventDetails, totalPages })
        } catch (error) {
            console.log('error while fetching the ticket and user details of the event', error)
            res.status(HttpStatus.BAD_REQUEST).json({
                message: 'error while fetching the ticket and user details of the event',
                error: error instanceof Error ? error.message : 'error while fetching the ticket and user details of the event'
            })
        }
    }
    async handleTicketConfirmation(req: Request, res: Response): Promise<void> {
        try {
            const { ticketId, eventId } = req.body
            const vendorId = (req as any).user.userId
            console.log('This is event id in controller', eventId)
            const verifiedTicket = await this.ticketVerificationUseCase.verifyTicket(ticketId, eventId, vendorId)
            res.status(HttpStatus.OK).json({ message: "Ticket verified", verifiedTicket })
        } catch (error) {
            console.log('error while ticket confirming', error)
            res.status(HttpStatus.BAD_REQUEST).json({
                message: "error while ticket confirming",
                error: error instanceof Error ? error.message : 'error while ticket confirming'
            })
        }
    }
}