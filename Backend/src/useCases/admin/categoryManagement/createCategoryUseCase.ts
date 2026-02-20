import { categoryEntity } from "../../../domain/entities/categoryEntity";
import { IcategoryRepository } from "../../../domain/interfaces/repositoryInterfaces/category/IcategoryRepository";
import { IcreateCategoryUseCase } from "../../../domain/interfaces/useCaseInterfaces/category/IcreateCategory";
import { generateRandomUuid } from "../../../framework/services/randomUuid";
export class CreateCategoryUseCase implements IcreateCategoryUseCase {
    private categoryDatabase: IcategoryRepository

    constructor(categoryDatabase: IcategoryRepository) {
        this.categoryDatabase = categoryDatabase
    }
    async createCategory(title: string, img: string): Promise<categoryEntity> {
        if(!title || title.trim().length<2){
            throw new Error("Title must be at least 2 characters")
        }
        if (!img || img.trim().length === 0) {
            throw new Error('Image URL is required');
        }

        const existingCategory = await this.categoryDatabase.findByName(title)
        if (existingCategory){
            console.log('Category already exists')
            throw new Error('This category is already exist')
            
        } 
        const categoryId = generateRandomUuid()
        return await this.categoryDatabase.createCategory(categoryId, title, img)
    }
}

