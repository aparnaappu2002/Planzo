import { CategoryUpdate } from "../../../entities/category/CategoryUpdate"

export interface IupdateCategoryUseCase {
    updateCategory(categoryId: string, updates: CategoryUpdate): Promise<boolean>
}