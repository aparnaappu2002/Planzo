import { Request, Response } from "express";
import { IfindAllEventsUseCase } from "../../../../domain/interfaces/useCaseInterfaces/client/events/IfindAllEventsUseCase";
import { HttpStatus } from "../../../../domain/entities/httpStatus";
import { IfindEventByIdUseCase } from "../../../../domain/interfaces/useCaseInterfaces/client/events/IfindEventByIdUseCase";

export class EventsClientController {
    private findAllEventClientUseCase: IfindAllEventsUseCase
    private findEventByIdUseCase:IfindEventByIdUseCase
    constructor(findAllEventClientUseCase: IfindAllEventsUseCase,findEventByIdUseCase:IfindEventByIdUseCase) {
        this.findAllEventClientUseCase = findAllEventClientUseCase
        this.findEventByIdUseCase=findEventByIdUseCase
    }
    async handleFindAllEventsClient(req: Request, res: Response): Promise<void> {
        try {
            const pageNo = parseInt(req.params.pageNo, 10) || 1
            const { events, totalPages } = await this.findAllEventClientUseCase.findAllEvents(pageNo)
            res.status(HttpStatus.OK).json({ message: 'Events fetched', events, totalPages })
        } catch (error) {
            console.log('error while finding all events', error)
            res.status(HttpStatus.BAD_REQUEST).json({
                message: "error while finding all events in client side",
                error: error instanceof Error ? error.message : 'error while finding all events in client side'
            })
        }
    }
    async handleFindEventById(req: Request, res: Response): Promise<void> {
        try {
            const { eventId } = req.params
            console.log(eventId)
            const event = await this.findEventByIdUseCase.findEventById(eventId)
            res.status(HttpStatus.OK).json({
                message: "Event found",
                event
            })
        } catch (error) {
            console.log("error while finding event by id", error)
            res.status(HttpStatus.BAD_REQUEST).json({
                message: "Error while finding event by id",
                error: error instanceof Error ? error.message : 'Error while finding event by id'
            })
        }
    }
}