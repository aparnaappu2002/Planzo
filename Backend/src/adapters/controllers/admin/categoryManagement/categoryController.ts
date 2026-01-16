import { Request, Response } from "express";
import { IcreateCategoryUseCase } from "../../../../domain/interfaces/useCaseInterfaces/category/IcreateCategory";
import { HttpStatus } from "../../../../domain/enums/httpStatus";
import { IfindCategoryUseCase } from "../../../../domain/interfaces/useCaseInterfaces/category/IfindCategoryUseCase";
import { IupdateCategoryUseCase } from "../../../../domain/interfaces/useCaseInterfaces/category/IupdateCategoryUseCase";
import { IchangeCategoryStatusUseCase } from "../../../../domain/interfaces/useCaseInterfaces/category/IchangeCategoryStatus";
import { Messages } from "../../../../domain/enums/messages";

export class CategoryController {
    private createCategoryUseCase: IcreateCategoryUseCase
    private findCategoryUseCase:IfindCategoryUseCase
    private updateCategoryUseCase:IupdateCategoryUseCase
    private changeCategoryStatusUseCase:IchangeCategoryStatusUseCase
    constructor(createCategoryConrollerUseCase: IcreateCategoryUseCase,findCategoryUseCase:IfindCategoryUseCase,
        updateCategoryUseCase:IupdateCategoryUseCase,chageCategoryStatusUseCase:IchangeCategoryStatusUseCase) {
        this.createCategoryUseCase = createCategoryConrollerUseCase
        this.findCategoryUseCase=findCategoryUseCase
        this.updateCategoryUseCase=updateCategoryUseCase
        this.changeCategoryStatusUseCase=chageCategoryStatusUseCase
    }
    async handleCreatecategory(req: Request, res: Response): Promise<void> {
        try {
            const { title, image } = req.body
            const category = await this.createCategoryUseCase.createCategory(title, image)
            res.status(HttpStatus.OK).json({ message: Messages.CATEGORY_CREATED, category })
        } catch (error) {
            //console.log('error while creating category', error)
            res.status(HttpStatus.BAD_REQUEST).json({
                message: Messages.CATEGORY_CREATE_ERROR,
                error: error instanceof Error ? error.message : Messages.CATEGORY_CREATE_ERROR
            })
        }
    }
    async handleFindCategory(req: Request, res: Response): Promise<void> {
        try {
            const pageNo = parseInt(req.query.pageNo as string, 10) || 1;
            const { categories, totalPages } = await this.findCategoryUseCase.findAllCategory(pageNo)
            res.status(HttpStatus.OK).json({ message: Messages.CATEGORY_FETCHED, categories, totalPages })
        } catch (error) {
            //console.log('error while fetching categories', error)
            res.status(HttpStatus.BAD_REQUEST).json({
                message: Messages.CATEGORY_FETCH_ERROR,
                error: error instanceof Error ? error.message : Messages.CATEGORY_FETCH_ERROR
            })
        }
    }
    async handleUpdateCategory(req: Request, res: Response): Promise<void> {
        try {
            const { categoryId, updates } = req.body
            //console.log(categoryId)
             await this.updateCategoryUseCase.updateCategory(categoryId, updates)
            res.status(HttpStatus.OK).json({ message: Messages.CATEGORY_UPDATED})
        } catch (error) {
            //console.log('error while changning titlle and image of category', error)
            res.status(HttpStatus.BAD_REQUEST).json({
                message: Messages.CATEGORY_UPDATE_ERROR,
                error: error instanceof Error ? error.message : Messages.CATEGORY_UPDATE_ERROR
            })
        }
    }
    async handleChangeCategoryStatus(req: Request, res: Response): Promise<void> {
        try {
            const { categoryId } = req.body
            const changeStatusOfCategory = await this.changeCategoryStatusUseCase.changeStatusCategory(categoryId)
            if (changeStatusOfCategory) res.status(HttpStatus.OK).json({ message: Messages.CATEGORY_STATUS_CHANGED })
        } catch (error) {
            //console.log('error while changing the status of the category', error)
            res.status(HttpStatus.BAD_REQUEST).json({
                message: Messages.CATEGORY_STATUS_ERROR,
                error: error instanceof Error ? error.message : Messages.CATEGORY_STATUS_ERROR
            })
        }
    }
}