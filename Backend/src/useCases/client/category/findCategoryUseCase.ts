import { categoryEntity } from "../../../domain/entities/categoryEntity";
import { IcategoryRepository } from "../../../domain/interfaces/repositoryInterfaces/category/IcategoryRepository";
import { IfindCategoryUseCaseClient } from "../../../domain/interfaces/useCaseInterfaces/client/category/IfindCategoryUseCase";

export class FindCategoryClientUseCase implements IfindCategoryUseCaseClient {
    private categoryDatabase: IcategoryRepository
    constructor(categoryDatabase: IcategoryRepository) {
        this.categoryDatabase = categoryDatabase
    }
    async findCategory(): Promise<categoryEntity[] | []> {
        return await this.categoryDatabase.findCategoryForClient()
    }
}