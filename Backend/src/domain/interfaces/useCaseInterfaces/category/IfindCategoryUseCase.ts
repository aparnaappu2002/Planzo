import { FindCategoryDTO } from "../../../dto/findCategoryDTO"

export interface IfindCategoryUseCase {
    findAllCategory(pageNo: number): Promise<{ categories: FindCategoryDTO[], totalPages: number }>
}