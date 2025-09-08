import { categoryEntity } from "../../../domain/entities/categoryEntity";
import { IcategoryRepository } from "../../../domain/interfaces/repositoryInterfaces/category/IcategoryRepository";
import { IfindCategoryForServiceUseCase } from "../../../domain/interfaces/useCaseInterfaces/vendor/service/IfindCategoryUseCaseInterface";
export class FindCategoryForServiceUseCase implements IfindCategoryForServiceUseCase {
    private categoryDatabase: IcategoryRepository
    constructor(categoryDatabase: IcategoryRepository) {
        this.categoryDatabase = categoryDatabase
    }
    async findCategoryForService(): Promise<categoryEntity[] | []> {
        return this.categoryDatabase.findCategoryForCreatingService()
    }
}
