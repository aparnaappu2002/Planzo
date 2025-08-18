import { CategoryUpdate } from "../../../domain/entities/category/CategoryUpdate";
import { IcategoryRepository } from "../../../domain/interfaces/repositoryInterfaces/category/IcategoryRepository";
import { IupdateCategoryUseCase } from "../../../domain/interfaces/useCaseInterfaces/category/IupdateCategoryUseCase";

export class UpdateCategoryUseCase implements IupdateCategoryUseCase {
    private categoryDatabase: IcategoryRepository
    constructor(categoryDatabase: IcategoryRepository) {
        this.categoryDatabase = categoryDatabase
    }
    async updateCategory(categoryId: string, updates: CategoryUpdate): Promise<boolean> {
        if (updates.title) {
            const existingCategory = await this.categoryDatabase.findByName(updates.title)
            if (existingCategory) throw new Error("There is already another category in this name")
        }
        const updateTitleAndImage = await this.categoryDatabase.changeNameAndImage(categoryId, updates)
        if (!updateTitleAndImage) throw new Error('No category presented in ID')
        return true
    }
}