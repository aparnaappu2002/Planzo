import { categoryEntity } from "../../domain/entities/categoryEntity";
import { FindCategoryDTO } from "../../domain/dto/findCategoryDTO";

export const mapCategoryEntityToDTO = (category: categoryEntity): FindCategoryDTO => ({
    _id: category._id?.toString(),
    categoryId: category.categoryId,
    title: category.title,
    image: category.image,
    status: category.status
});