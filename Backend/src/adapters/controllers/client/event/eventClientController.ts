import { Request, Response } from "express";
import { IfindAllEventsUseCase } from "../../../../domain/interfaces/useCaseInterfaces/client/events/IfindAllEventsUseCase";
import { HttpStatus } from "../../../../domain/entities/httpStatus";
import { IfindEventByIdUseCase } from "../../../../domain/interfaces/useCaseInterfaces/client/events/IfindEventByIdUseCase";
import { IsearchEventsUseCase } from "../../../../domain/interfaces/useCaseInterfaces/client/events/IsearchEventsUseCase";
import { IfindEventsNearToClientUseCase } from "../../../../domain/interfaces/useCaseInterfaces/client/events/IfindEventsNearToClient";
import { IfindEventsBasedOnCategoryUseCase } from "../../../../domain/interfaces/useCaseInterfaces/client/events/IfindEventsBasedOnCategory";

export class EventsClientController {
    private findAllEventClientUseCase: IfindAllEventsUseCase
    private findEventByIdUseCase:IfindEventByIdUseCase
    private searchEventsUseCase: IsearchEventsUseCase
    private findEventsNearToClient: IfindEventsNearToClientUseCase
    private findEventsBasedOnCategory: IfindEventsBasedOnCategoryUseCase
    constructor(findAllEventClientUseCase: IfindAllEventsUseCase,findEventByIdUseCase:IfindEventByIdUseCase,
        searchEventsUseCase:IsearchEventsUseCase,findEventsNearToClient:IfindEventsNearToClientUseCase,
        findEventsBasedOnCategory:IfindEventsBasedOnCategoryUseCase) {
        this.findAllEventClientUseCase = findAllEventClientUseCase
        this.findEventByIdUseCase=findEventByIdUseCase
        this.searchEventsUseCase=searchEventsUseCase
        this.findEventsNearToClient=findEventsNearToClient
        this.findEventsBasedOnCategory=findEventsBasedOnCategory
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
    async handleSearchEvents(req: Request, res: Response): Promise<void> {
        try {
            const query = req.query.query
            console.log("searchQuery:",query)
            if (typeof query !== 'string') {
                res.status(HttpStatus.BAD_REQUEST).json({ message: 'Invalid query' })
                return
            }
            const searchEvents = await this.searchEventsUseCase.searchEvents(query)
            console.log("SearchEvents",searchEvents)
            res.status(HttpStatus.OK).json({ message: 'events based on search', searchEvents })
        } catch (error) {
            console.log('error while performing search in events', error)
            res.status(HttpStatus.BAD_REQUEST).json({
                message: 'error while performing search in events',
                error: error instanceof Error ? error.message : 'error while performing search in events'
            })
        }
    }
    async handleEventsNearToUse(req: Request, res: Response): Promise<void> {
        try {
            const { latitude, longitude, pageNo, range } = req.params
            const kmRange = parseInt(range, 10) || 30000
            const page = parseInt(pageNo, 10) || 1
            const lat = parseFloat(latitude)
            const log = parseFloat(longitude)
            const { events, totalPages } = await this.findEventsNearToClient.findEventsNearToClient(lat, log, page, kmRange)
            res.status(HttpStatus.OK).json({ message: "Events fetched near to the user", events, totalPages })
        } catch (error) {
            console.log('error while finding the events near to you', error)
            res.status(HttpStatus.BAD_REQUEST).json({
                message: 'error while finding the events near to you',
                error: error instanceof Error ? error.message : 'error while finding the events near to you'
            })
        }
    }
    async handleFindEventsBasedOnCategory(req: Request, res: Response): Promise<void> {
        try {
            const { category, pageNo, sortBy } = req.params
            console.log(category,pageNo,sortBy)
            const page = parseInt(pageNo, 10) || 1
            const { events, totalPages } = await this.findEventsBasedOnCategory.findEventsbasedOnCategory(category, page, sortBy)
            console.log(events)
            res.status(HttpStatus.OK).json({ message: "events fetched", events, totalPages })
        } catch (error) {
            console.log('error while finding events based on category', error)
            res.status(HttpStatus.BAD_REQUEST).json({
                message: 'error while finding events based on category',
                error: error instanceof Error ? error.message : 'error while finding events based on category'
            })
        }
    }
}