import { Request, Response } from "express";
import { IfindAllEventsUseCase } from "../../../../domain/interfaces/useCaseInterfaces/client/events/IfindAllEventsUseCase";
import { HttpStatus } from "../../../../domain/enums/httpStatus";
import { IfindEventByIdUseCase } from "../../../../domain/interfaces/useCaseInterfaces/client/events/IfindEventByIdUseCase";
import { IsearchEventsUseCase } from "../../../../domain/interfaces/useCaseInterfaces/client/events/IsearchEventsUseCase";
import { IfindEventsNearToClientUseCase } from "../../../../domain/interfaces/useCaseInterfaces/client/events/IfindEventsNearToClient";
import { IfindEventsBasedOnCategoryUseCase } from "../../../../domain/interfaces/useCaseInterfaces/client/events/IfindEventsBasedOnCategory";
import { IsearchEventsOnLocationUseCase } from "../../../../domain/interfaces/useCaseInterfaces/client/events/IsearchEventsOnLocationUseCase";
import { Messages } from "../../../../domain/enums/messages";

export class EventsClientController {
    private findAllEventClientUseCase: IfindAllEventsUseCase
    private findEventByIdUseCase:IfindEventByIdUseCase
    private searchEventsUseCase: IsearchEventsUseCase
    private findEventsNearToClient: IfindEventsNearToClientUseCase
    private findEventsBasedOnCategory: IfindEventsBasedOnCategoryUseCase
    private searchEventsOnLocationUseCase: IsearchEventsOnLocationUseCase
    constructor(findAllEventClientUseCase: IfindAllEventsUseCase,findEventByIdUseCase:IfindEventByIdUseCase,
        searchEventsUseCase:IsearchEventsUseCase,findEventsNearToClient:IfindEventsNearToClientUseCase,
        findEventsBasedOnCategory:IfindEventsBasedOnCategoryUseCase,searchEventsOnLocationUseCase:IsearchEventsOnLocationUseCase) {
        this.findAllEventClientUseCase = findAllEventClientUseCase
        this.findEventByIdUseCase=findEventByIdUseCase
        this.searchEventsUseCase=searchEventsUseCase
        this.findEventsNearToClient=findEventsNearToClient
        this.findEventsBasedOnCategory=findEventsBasedOnCategory
        this.searchEventsOnLocationUseCase=searchEventsOnLocationUseCase
    }
    async handleFindAllEventsClient(req: Request, res: Response): Promise<void> {
        try {
            const pageNo = parseInt(req.params.pageNo, 10) || 1
            const { events, totalPages } = await this.findAllEventClientUseCase.findAllEvents(pageNo)
            res.status(HttpStatus.OK).json({ message: Messages.EVENT_FETCHED, events, totalPages })
        } catch (error) {
            console.log('error while finding all events', error)
            res.status(HttpStatus.BAD_REQUEST).json({
                message: Messages.EVENT_FETCH_ERROR,
                error: error instanceof Error ? error.message : Messages.EVENT_FETCH_ERROR
            })
        }
    }
    async handleFindEventById(req: Request, res: Response): Promise<void> {
        try {
            const { eventId } = req.params
            console.log(eventId)
            const event = await this.findEventByIdUseCase.findEventById(eventId)
            res.status(HttpStatus.OK).json({
                message: Messages.EVENT_FOUND,
                event
            })
        } catch (error) {
            console.log("error while finding event by id", error)
            res.status(HttpStatus.BAD_REQUEST).json({
                message: Messages.EVENT_NOT_FOUND,
                error: error instanceof Error ? error.message : Messages.EVENT_NOT_FOUND
            })
        }
    }
    async handleSearchEvents(req: Request, res: Response): Promise<void> {
        try {
            const query = req.query.query
            if (typeof query !== 'string') {
                res.status(HttpStatus.BAD_REQUEST).json({ message: Messages.INVALID_INPUT })
                return
            }
            const searchEvents = await this.searchEventsUseCase.searchEvents(query)
            console.log("SearchEvents",searchEvents)
            res.status(HttpStatus.OK).json({ message: Messages.EVENT_FOUND, searchEvents })
        } catch (error) {
            console.log('error while performing search in events', error)
            res.status(HttpStatus.BAD_REQUEST).json({
                message: Messages.EVENT_NOT_FOUND,
                error: error instanceof Error ? error.message : Messages.EVENT_NOT_FOUND
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
            res.status(HttpStatus.OK).json({ message: Messages.EVENT_FETCH_NEAR, events, totalPages })
        } catch (error) {
            console.log('error while finding the events near to you', error)
            res.status(HttpStatus.BAD_REQUEST).json({
                message: Messages.EVENT_FETCH_NEAR_ERROR,
                error: error instanceof Error ? error.message : Messages.EVENT_FETCH_NEAR_ERROR
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
            res.status(HttpStatus.OK).json({ message: Messages.EVENT_FETCHED, events, totalPages })
        } catch (error) {
            console.log('error while finding events based on category', error)
            res.status(HttpStatus.BAD_REQUEST).json({
                message: Messages.EVENT_FETCH_ERROR,
                error: error instanceof Error ? error.message : Messages.EVENT_FETCH_ERROR
            })
        }
    }
    async handleEventsNearLocation(req: Request, res: Response): Promise<void> {
        try {
            const { locationQuery, pageNo, limit, range } = req.body;
            
            // Validate required fields
            if (!locationQuery || locationQuery.trim() === '') {
                res.status(HttpStatus.BAD_REQUEST).json({
                    message: Messages.LOCATION_QUERY_REQUIRED,
                    error: 'Please provide a valid location query'
                });
                return;
            }

            // Parse and validate optional parameters
            const page = parseInt(pageNo, 10) || 1;
            const itemsPerPage = parseInt(limit, 10) || 10;
            const searchRange = parseInt(range, 10) || 25;

            // Validate parameters
            if (page < 1) {
                res.status(HttpStatus.BAD_REQUEST).json({
                    message: 'Invalid page number',
                    error: 'Page number must be greater than 0'
                });
                return;
            }

            if (itemsPerPage < 1 || itemsPerPage > 100) {
                res.status(HttpStatus.BAD_REQUEST).json({
                    message: 'Invalid limit',
                    error: 'Limit must be between 1 and 100'
                });
                return;
            }

            // Call use case
            const result = await this.searchEventsOnLocationUseCase.searchEventsByLocation(
                locationQuery.trim(), 
                { 
                    pageNo: page, 
                    limit: itemsPerPage, 
                    range: searchRange 
                }
            );

            res.status(HttpStatus.OK).json({
                message: `Events found near ${locationQuery}`,
                success: true,
                data: result,
                pagination: {
                    currentPage: page,
                    totalPages: result.totalPages,
                    totalEvents: result.totalCount,
                    eventsPerPage: itemsPerPage,
                    hasNextPage: page < result.totalPages,
                    hasPreviousPage: page > 1
                }
            });

        } catch (error) {
            console.error('Error while finding events near location:', error);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: Messages.EVENTS_NEAR_LOCATION_ERROR,
                success: false,
                error: error instanceof Error ? error.message : Messages.EVENTS_NEAR_LOCATION_ERROR
            });
        }
    }

}