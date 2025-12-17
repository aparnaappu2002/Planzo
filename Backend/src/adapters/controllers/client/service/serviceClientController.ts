import { Request, Response } from "express";
import { IfindServiceUseCase } from "../../../../domain/interfaces/useCaseInterfaces/client/service/IfindServiceUseCase";
import { HttpStatus } from "../../../../domain/enums/httpStatus";
import { IfindServiceOnCategorybasis } from "../../../../domain/interfaces/useCaseInterfaces/client/service/IfindServiceServiceOnCategory";
import { IsearchServiceUseCase } from "../../../../domain/interfaces/useCaseInterfaces/client/service/IsearchServiceUseCase";
import { Messages } from "../../../../domain/enums/messages";

export class ServiceClientController {
    private findServiceUseCase: IfindServiceUseCase
    private findServiceOnCategory:IfindServiceOnCategorybasis
    private searchServiceUseCase:IsearchServiceUseCase
    constructor(findServiceUseCase: IfindServiceUseCase,findServiceOnCategory:IfindServiceOnCategorybasis,searchServiceUseCase:IsearchServiceUseCase) {
        this.findServiceUseCase = findServiceUseCase
        this.findServiceOnCategory=findServiceOnCategory
        this.searchServiceUseCase=searchServiceUseCase
    }
    async handleFindServiceForClient(req: Request, res: Response): Promise<void> {
        try {
            const pageNo = parseInt(req.params.pageNo as string, 10) || 1
            const { Services, totalPages } = await this.findServiceUseCase.findServiceForclient(pageNo)
            res.status(HttpStatus.OK).json({ message: Messages.SERVICE_FETCHED, Services, totalPages })
        } catch (error) {
            console.log('error while fetching service for client', error)
            res.status(HttpStatus.BAD_REQUEST).json({
                message: Messages.SERVICE_FETCH_ERROR,
                error: error instanceof Error ? error.message : Messages.SERVICE_FETCH_ERROR
            })
        }
    }
    async handleFindServiceOnCategorybasis(req: Request, res: Response): Promise<void> {
        try {

            const { pageNo = 1, sortBy } = req.query;
            const page = parseInt(pageNo as string, 10) || 1
            const rawCategoryId = req.query.categoryId;
            const catId = (typeof rawCategoryId === 'string'
                ? rawCategoryId
                : Array.isArray(rawCategoryId)
                    ? rawCategoryId[0]
                    : null) as string | null;
            const sort = typeof sortBy === 'string' ? sortBy : 'a-z';
            const { Services, totalPages } = await this.findServiceOnCategory.findServiceBasedOnCatagory(catId, page, sort)
            res.status(HttpStatus.OK).json({ message: Messages.SERVICES_FETCHED_BY_CATEGORY, Services, totalPages })
        } catch (error) {
            console.log('error while finding services on basis of cateogry', error)
            res.status(HttpStatus.BAD_REQUEST).json({
                message: Messages.SERVICE_FETCH_ERROR,
                error: error instanceof Error ? error.message : Messages.SERVICE_FETCH_ERROR
            })
        }
    }
    async handleSearchService(req: Request, res: Response): Promise<void> {
        try {
            const queryParam = req.query.query;

            if (typeof queryParam !== 'string') {
                res.status(HttpStatus.BAD_REQUEST).json({ message: Messages.INVALID_QUERY_PARAMETER });
                return;
            }

            const searchedService = await this.searchServiceUseCase.searchService(queryParam)
            res.status(HttpStatus.OK).json({ message: Messages.SERVICE_SEARCHED, searchedService })
        } catch (error) {
            console.log('error while performing search service', error)
            res.status(HttpStatus.BAD_REQUEST).json({
                message: Messages.ERROR_SEARCHING_SERVICE,
                error: error instanceof Error ? error.message : Messages.ERROR_SEARCHING_SERVICE
            })
        }
    }
}