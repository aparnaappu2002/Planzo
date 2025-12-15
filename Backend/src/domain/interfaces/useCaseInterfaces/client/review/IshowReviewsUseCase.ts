import { ReviewDetailsDTO } from "../../../../dto/reviewDetailsDTO";

export interface IshowReviewsUseCase {
    showReviews(targetId: string, pageNo: number, rating: number): Promise<{ reviews: ReviewDetailsDTO[] | [], totalPages: number }>
}