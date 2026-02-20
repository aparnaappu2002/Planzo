import { Request, Response } from "express";
import { IfindCategoryUseCaseClient } from "../../../../domain/interfaces/useCaseInterfaces/client/category/IfindCategoryUseCase";
import { HttpStatus } from "../../../../domain/enums/httpStatus";
import { Messages } from "../../../../domain/enums/messages";
import { handleErrorResponse,logError } from "../../../../framework/services/errorHandler";

export class CategoryClientController {
    private findCategoryClientUSeCase: IfindCategoryUseCaseClient
    constructor(findCategoryClientUSeCase: IfindCategoryUseCaseClient) {
        this.findCategoryClientUSeCase = findCategoryClientUSeCase
    }
    async handleFindCategoryClient(req: Request, res: Response): Promise<void> {
        try {
            const categories = await this.findCategoryClientUSeCase.findCategory()
            res.status(HttpStatus.OK).json({ message: Messages.CATEGORY_FETCHED, categories })
        } catch (error) {
            logError('Error while fetching categories in client side', error);
            handleErrorResponse(req, res, error, Messages.CATEGORY_FETCH_ERROR);
        }
    }
}