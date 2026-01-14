import { Request, Response } from "express";
import { IeventCreationUseCase } from "../../../../domain/interfaces/useCaseInterfaces/vendor/event/IeventCreationUseCase";
import { HttpStatus } from "../../../../domain/enums/httpStatus";
import { IfindAllEventsVendorUseCase } from "../../../../domain/interfaces/useCaseInterfaces/vendor/event/IfindAllEventsUseCase";
import { IupdateEventUseCase } from "../../../../domain/interfaces/useCaseInterfaces/vendor/event/IupdateEventUseCase";
import { IsearchEventsVendorUseCase } from "../../../../domain/interfaces/useCaseInterfaces/vendor/event/IsearchEventsVendorUseCase";

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
            const createdEvent = await this.eventCreateUseCase.createEvent(event, vendorId)
            res.status(HttpStatus.CREATED).json({ message: "Event created", createdEvent })
        } catch (error) {
            console.log('error while creating event', error)
            res.status(HttpStatus.BAD_REQUEST).json({
                message: 'error while creating event',
                error: error instanceof Error ? error.message : 'error while creating event'
            })
        }
    }
    async handleFindAllEventsVendor(req: Request, res: Response): Promise<void> {
        try {
            const vendorId = req.params.vendorId
            const pageNo = parseInt(req.params.pageNo, 10) || 1
            const { events, totalPages } = await this.findAllEventsVendorUseCase.findAllEvents(vendorId, pageNo)
            res.status(HttpStatus.OK).json({ message: "Events fetched", events, totalPages })
        } catch (error) {
            console.log('error while finding all events in vendor side', error)
            res.status(HttpStatus.BAD_REQUEST).json({
                message: 'error while finding all events in vendor side',
                error: error instanceof Error ? error.message : 'error while finding all events in vendor side'
            })
        }
        
    }
    async handleUpdateEvent(req: Request, res: Response): Promise<void> {
        try {
            const { eventId, update } = req.body
            const updatedEvent = await this.updateEventUseCase.updateEvent(eventId, update)
            res.status(HttpStatus.OK).json({ message: "Event Updated", updatedEvent })
        } catch (error) {
            console.log('Error while updating event', error)
            res.status(HttpStatus.BAD_REQUEST).json({
                message: "error while updating event",
                error: error instanceof Error ? error.message : 'Error while updating event'
            })
        }
    }
    async handleSearchEvents(req: Request, res: Response): Promise<void> {
        try {
            const vendorId =  req.query.vendorId as string; 
            const { searchQuery } = req.query;
            const pageNo = parseInt(req.query.pageNo as string) || 1;
    
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
            console.log('Error while searching events', error);
            res.status(HttpStatus.BAD_REQUEST).json({
                message: "Error while searching events",
                error: error instanceof Error ? error.message : 'Error while searching events'
            });
        }
    }
}