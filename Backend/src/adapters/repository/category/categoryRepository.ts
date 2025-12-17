import { categoryEntity } from "../../../domain/entities/categoryEntity";
import { IcategoryRepository } from "../../../domain/interfaces/repositoryInterfaces/category/IcategoryRepository";
import { categoryModel } from "../../../framework/database/models/categoryModel";
import { CategoryUpdate } from "../../../domain/entities/category/CategoryUpdate";

export class CategoryDatabaseRepository implements IcategoryRepository {
    async findByName(name: string): Promise<categoryEntity | null> {
        return await categoryModel.findOne({
            title: { $regex: `^${name}$`, $options: "i" } 
        });
    }
    async createCategory(categoryId: string, title: string, image: string): Promise<categoryEntity> {
        return await categoryModel.create({ categoryId, title, image })
    }
    async findCategory(pageNo: number): Promise<{ categories: categoryEntity[] | []; totalPages: number; }> {
        const limit = 8
        const page = Math.max(pageNo, 1)
        const skip = (page - 1) * limit
        const categories = await categoryModel.find().skip(skip).limit(limit)
        const totalPages = Math.ceil(await categoryModel.countDocuments() / limit)
        return { categories, totalPages }
    }
    async changeNameAndImage(categoryId: string, updates: CategoryUpdate): Promise<boolean | null> {
        if (!Object.keys(updates).length) return false;

        const updatedCategory = await categoryModel.findByIdAndUpdate(
            categoryId,
            updates,
            { new: true }
        );

        return updatedCategory ? true : false;
    }
    async changeStatusOfCategory(categoryId: string): Promise<categoryEntity | null> {
        return await categoryModel.findOneAndUpdate({ _id: categoryId },
            [
                {
                    $set: {
                        status: {
                            $cond: {
                                if: { $eq: ['$status', 'active'] },
                                then: 'blocked',
                                else: 'active'
                            }
                        }
                    }
                }
            ]
        )
    }

    async findCategoryForClient(): Promise<categoryEntity[] | []> {
        return await categoryModel.find({ status: 'active' }).select('_id image title').limit(5)
    }
    async findCategoryForCreatingService(): Promise<categoryEntity[] | []> {
        return await categoryModel.find({ status: 'active' }).select('title _id')
    }
    
}   

