import { Request, Response } from "express";
import { IfindCategoryUseCaseClient } from "../../../../domain/interfaces/useCaseInterfaces/client/category/IfindCategoryUseCase";
import { HttpStatus } from "../../../../domain/entities/httpStatus";

export class CategoryClientController {
    private findCategoryClientUSeCase: IfindCategoryUseCaseClient
    constructor(findCategoryClientUSeCase: IfindCategoryUseCaseClient) {
        this.findCategoryClientUSeCase = findCategoryClientUSeCase
    }
    async handleFindCategoryClient(req: Request, res: Response): Promise<void> {
        try {
            const categories = await this.findCategoryClientUSeCase.findCategory()
            res.status(HttpStatus.OK).json({ message: 'Category fetched', categories })
        } catch (error) {
            console.log('error while fetching categories in client side', error)
            res.status(HttpStatus.BAD_REQUEST).json({
                message: 'error while fetching categories in client side',
                error: error instanceof Error ? error.message : 'error while fetching categories in client side'
            })
        }
    }
}