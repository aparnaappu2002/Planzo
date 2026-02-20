import { Request, Response } from "express";
import { IeventCreationUseCase } from "../../../../domain/interfaces/useCaseInterfaces/vendor/event/IeventCreationUseCase";
import { HttpStatus } from "../../../../domain/enums/httpStatus";
import { IfindAllEventsVendorUseCase } from "../../../../domain/interfaces/useCaseInterfaces/vendor/event/IfindAllEventsUseCase";
import { IupdateEventUseCase } from "../../../../domain/interfaces/useCaseInterfaces/vendor/event/IupdateEventUseCase";
import { IsearchEventsVendorUseCase } from "../../../../domain/interfaces/useCaseInterfaces/vendor/event/IsearchEventsVendorUseCase";
import { handleErrorResponse,logError } from "../../../../framework/services/errorHandler";

export class EventController {
    private eventCreateUseCase: IeventCreationUseCase
    private findAllEventsVendorUseCase: IfindAllEventsVendorUseCase
     private updateEventUseCase: IupdateEventUseCase
     private searchEventsVendorUseCase:IsearchEventsVendorUseCase
    constructor(eventCreateUseCase: IeventCreationUseCase,findAllEventsVendorUseCase: IfindAllEventsVendorUseCase,updateEventUseCase: IupdateEventUseCase,searchEventsVendorUseCase:IsearchEventsVendorUseCase) {
        this.eventCreateUseCase = eventCreateUseCase
        this.findAllEventsVendorUseCase=findAllEventsVendorUseCase
        this.updateEventUseCase=updateEventUseCase
        this.searchEventsVendorUseCase=searchEventsVendorUseCase
    }
    async handleCreateEvent(req: Request, res: Response): Promise<void> {
        try {
            const { vendorId } = req.params
            const { event } = req.body
            if (!vendorId) {
                res.status(HttpStatus.BAD_REQUEST).json({
                    message: 'Vendor ID is required'
                });
                return;
            }
            if (!event) {
                res.status(HttpStatus.BAD_REQUEST).json({
                    message: 'Event data is required'
                });
                return;
            }
            const createdEvent = await this.eventCreateUseCase.createEvent(event, vendorId)
            res.status(HttpStatus.CREATED).json({ message: "Event created", createdEvent })
        } catch (error) {
            logError('Error while creating event', error);
            handleErrorResponse(req, res, error, 'Failed to create event');
        }
    }
    async handleFindAllEventsVendor(req: Request, res: Response): Promise<void> {
        try {
            const vendorId = req.params.vendorId
            if (!vendorId) {
                res.status(HttpStatus.BAD_REQUEST).json({
                    message: 'Vendor ID is required'
                });
                return;
            }
            const pageNo = parseInt(req.params.pageNo, 10) || 1
            const { events, totalPages } = await this.findAllEventsVendorUseCase.findAllEvents(vendorId, pageNo)
            res.status(HttpStatus.OK).json({ message: "Events fetched", events, totalPages })
        } catch (error) {
            logError('Error while finding all events in vendor side', error);
            handleErrorResponse(req, res, error, 'Failed to fetch vendor events');
        }
        
    }
    async handleUpdateEvent(req: Request, res: Response): Promise<void> {
        try {
            const { eventId, update } = req.body
            if (!eventId) {
                res.status(HttpStatus.BAD_REQUEST).json({
                    message: 'Event ID is required'
                });
                return;
            }
            const updatedEvent = await this.updateEventUseCase.updateEvent(eventId, update)
            res.status(HttpStatus.OK).json({ message: "Event Updated", updatedEvent })
        } catch (error) {
            logError('Error while updating event', error);
            handleErrorResponse(req, res, error, 'Failed to update event');
        }
    }
    async handleSearchEvents(req: Request, res: Response): Promise<void> {
        try {
            const vendorId =  req.query.vendorId as string; 
            const { searchQuery } = req.query;
            const pageNo = parseInt(req.query.pageNo as string) || 1;

            if (!vendorId) {
                res.status(HttpStatus.BAD_REQUEST).json({
                    message: 'Vendor ID is required'
                });
                return;
            }
    
            if (!searchQuery || typeof searchQuery !== 'string') {
                res.status(HttpStatus.BAD_REQUEST).json({
                    message: "Search query is required"
                });
                return;
            }
    
            const { events, totalPages, totalResults } = 
                await this.searchEventsVendorUseCase.searchEvents(
                    vendorId,
                    searchQuery,
                    pageNo
                );
    
            res.status(HttpStatus.OK).json({
                message: "Events retrieved successfully",
                events,
                totalPages,
                totalResults,
                currentPage: pageNo
            });
        } catch (error) {
            logError('Error while searching events', error);
            handleErrorResponse(req, res, error, 'Failed to search events');
        }
    }
}