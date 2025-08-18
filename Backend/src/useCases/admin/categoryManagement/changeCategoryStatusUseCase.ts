import { IcategoryRepository } from "../../../domain/interfaces/repositoryInterfaces/category/IcategoryRepository";
import { IchangeCategoryStatusUseCase } from "../../../domain/interfaces/useCaseInterfaces/category/IchangeCategoryStatus";

export class ChangeCategoryStatusUseCase implements IchangeCategoryStatusUseCase {
    private categoryDatabase: IcategoryRepository
    constructor(categoryDatabase: IcategoryRepository) {
        this.categoryDatabase = categoryDatabase
    }
    async changeStatusCategory(categoryId: string): Promise<boolean> {
        const statusChangedCategory = await this.categoryDatabase.changeStatusOfCategory(categoryId)
        if (!statusChangedCategory) throw new Error('No category found in this ID')
        return true
    }
    
}