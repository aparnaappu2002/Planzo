import { Request, Response } from "express";
import { HttpStatus } from "../../../../domain/enums/httpStatus";
import { IfindEventsInAdminSideUseCase } from "../../../../domain/interfaces/useCaseInterfaces/admin/eventManagement/IfindEventsInAdminSide";
import { Messages } from "../../../../domain/enums/messages";
import { handleErrorResponse,logError } from "../../../../framework/services/errorHandler";

export class FindEventsInAdminSideController {
    private findEventsInAdminUseCase: IfindEventsInAdminSideUseCase
    constructor(findEventsInAdminUseCase: IfindEventsInAdminSideUseCase) {
        this.findEventsInAdminUseCase = findEventsInAdminUseCase
    }
    async handleListingEventsInAdminSide(req: Request, res: Response): Promise<void> {
        try {
            const { pageNo } = req.query
            const page = parseInt(pageNo as string, 10) || 1
            const { events, totalPages } = await this.findEventsInAdminUseCase.findEvents(page)
            res.status(HttpStatus.OK).json({ message: Messages.EVENT_FETCHED, events, totalPages })
        } catch (error) {
            logError('Error while listing events in the admin side', error);
            handleErrorResponse(req, res, error, Messages.EVENT_FETCH_ERROR);
        }
    }
}