import mongoose from "mongoose";
import { ReviewDetailsDTO } from "../../../domain/dto/reviewDetailsDTO";
import { ReviewEntity } from "../../../domain/entities/reviewEntity";
import { IreviewRepository } from "../../../domain/interfaces/repositoryInterfaces/review/IreviewRepository";
import { reviewModel } from "../../../framework/database/models/reviewModel";

export class ReviewRepository implements IreviewRepository {
    async createReview(review: ReviewEntity): Promise<ReviewEntity> {
        return reviewModel.create(review)
    }
    async findReviews(targetId: string, pageNo: number, rating?: number): Promise<{ reviews: ReviewDetailsDTO[] | [], totalPages: number }> {
        const page = Math.max(pageNo, 1)
        const limit = 3
        const skip = (page - 1) * limit
        const filter: any = {
            targetId: new mongoose.Types.ObjectId(targetId),
            
        };
        
        const reviews = await reviewModel.find({ ...filter }).populate('reviewerId', 'name profileImage').skip(skip).limit(limit).sort({ createdAt: -1 }).lean<ReviewDetailsDTO[]>()
        const totalPages = Math.ceil(await reviewModel.countDocuments({ targetId }) / limit)
        return { reviews, totalPages }
    }
}