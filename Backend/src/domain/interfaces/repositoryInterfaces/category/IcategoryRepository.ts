import { categoryEntity } from "../../../entities/categoryEntity";
import { CategoryUpdate } from "../../../entities/category/CategoryUpdate";

export interface IcategoryRepository {
    findByName(name: string): Promise<categoryEntity | null>
    createCategory(categoryId: string, title: string, image: string): Promise<categoryEntity>
    findCategory(pageNo: number): Promise<{ categories: categoryEntity[] | [], totalPages: number }>
    changeNameAndImage(categoryId: string, updates: CategoryUpdate): Promise<boolean | null>
    changeStatusOfCategory(categoryId: string): Promise<categoryEntity | null>
    findCategoryForClient(): Promise<categoryEntity[] | []>
    findCategoryForCreatingService(): Promise<categoryEntity[] | []>
}

