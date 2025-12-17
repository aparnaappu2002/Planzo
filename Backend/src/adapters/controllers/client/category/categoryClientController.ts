import { Request, Response } from "express";
import { IfindCategoryUseCaseClient } from "../../../../domain/interfaces/useCaseInterfaces/client/category/IfindCategoryUseCase";
import { HttpStatus } from "../../../../domain/enums/httpStatus";
import { Messages } from "../../../../domain/enums/messages";

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
            console.log('error while fetching categories in client side', error)
            res.status(HttpStatus.BAD_REQUEST).json({
                message: Messages.CATEGORY_FETCH_ERROR,
                error: error instanceof Error ? error.message : Messages.CATEGORY_FETCH_ERROR
            })
        }
    }
}