import { ReviewDetailsDTO } from "../../../dto/reviewDetailsDTO";
import { ReviewEntity } from "../../../entities/reviewEntity";

export interface IreviewRepository {
    createReview(review: ReviewEntity): Promise<ReviewEntity>
    findReviews(targetId: string, pageNo: number, rating?: number): Promise<{ reviews: ReviewDetailsDTO[] | [], totalPages: number,}>
}