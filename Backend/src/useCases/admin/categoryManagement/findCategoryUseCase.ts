import { categoryEntity } from "../../../domain/entities/categoryEntity";
import { IcategoryRepository } from "../../../domain/interfaces/repositoryInterfaces/category/IcategoryRepository";
import { IfindCategoryUseCase } from "../../../domain/interfaces/useCaseInterfaces/category/IfindCategoryUseCase";

export class FindCategoryUseCase implements IfindCategoryUseCase {
    private categoryDatabase: IcategoryRepository
    constructor(categoryDatabase: IcategoryRepository) {
        this.categoryDatabase = categoryDatabase
    }
    async findAllCategory(pageNo: number): Promise<{ categories: categoryEntity[] | []; totalPages: number; }> {
        const { categories, totalPages } = await this.categoryDatabase.findCategory(pageNo)
        return { categories, totalPages }
    }
}