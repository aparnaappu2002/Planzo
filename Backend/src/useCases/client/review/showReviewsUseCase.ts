import { ReviewDetailsDTO } from "../../../domain/dto/reviewDetailsDTO";
import { IreviewRepository } from "../../../domain/interfaces/repositoryInterfaces/review/IreviewRepository";
import { IshowReviewsUseCase } from "../../../domain/interfaces/useCaseInterfaces/client/review/IshowReviewsUseCase";

export class ShowReviewsUseCase implements IshowReviewsUseCase {
    private reviewDatabase: IreviewRepository
    constructor(reviewDatabase: IreviewRepository) {
        this.reviewDatabase = reviewDatabase
    }
    async showReviews(targetId: string, pageNo: number, rating: number): Promise<{ reviews: ReviewDetailsDTO[] | []; totalPages: number; }> {
        return await this.reviewDatabase.findReviews(targetId, pageNo, rating)
    }
}