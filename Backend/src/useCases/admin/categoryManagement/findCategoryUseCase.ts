import { FindCategoryDTO } from "../../../domain/dto/findCategoryDTO";
import { IcategoryRepository } from "../../../domain/interfaces/repositoryInterfaces/category/IcategoryRepository";
import { IfindCategoryUseCase } from "../../../domain/interfaces/useCaseInterfaces/category/IfindCategoryUseCase";
import { mapCategoryEntityToDTO } from "../../mappers/categoryMapper";

export class FindCategoryUseCase implements IfindCategoryUseCase {
    private categoryDatabase: IcategoryRepository
    constructor(categoryDatabase: IcategoryRepository) {
        this.categoryDatabase = categoryDatabase
    }
    async findAllCategory(pageNo: number): Promise<{ categories: FindCategoryDTO[]; totalPages: number; }> {
        const { categories, totalPages } = await this.categoryDatabase.findCategory(pageNo)
        return {
            categories: categories.map(mapCategoryEntityToDTO),
            totalPages
        };

    }
}