import { ReviewEntity } from "../../../../entities/reviewEntity"

export interface IaddReviewUseCase {
    addReview(review: ReviewEntity): Promise<ReviewEntity>
}