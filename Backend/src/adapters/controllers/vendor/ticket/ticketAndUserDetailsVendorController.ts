import { Request, Response } from "express";
import { IticketAndUserDetailsOfEventUseCase } from "../../../../domain/interfaces/useCaseInterfaces/vendor/ticket/ticketAndUserDetailsOfEventUseCase";
import { HttpStatus } from "../../../../domain/entities/httpStatus";

export class TicketAndUserDetailsController {
    private ticketAndUserDetailsUseCase: IticketAndUserDetailsOfEventUseCase
    constructor(ticketAndUserDetailsUseCase: IticketAndUserDetailsOfEventUseCase) {
        this.ticketAndUserDetailsUseCase = ticketAndUserDetailsUseCase
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
}