import { ReviewEntity } from "../../../domain/entities/reviewEntity";
import { IreviewRepository } from "../../../domain/interfaces/repositoryInterfaces/review/IreviewRepository";
import { IaddReviewUseCase } from "../../../domain/interfaces/useCaseInterfaces/client/review/IaddReviewUseCase";

export class AddReviewUseCase implements IaddReviewUseCase {
    private reviewDatabase: IreviewRepository
    constructor(reviewDatabase: IreviewRepository) {
        this.reviewDatabase = reviewDatabase
    }
    async addReview(review: ReviewEntity): Promise<ReviewEntity> {
        return await this.reviewDatabase.createReview(review)
    }
}