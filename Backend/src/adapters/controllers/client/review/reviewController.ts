import { Request, Response } from "express";
import { IaddReviewUseCase } from "../../../../domain/interfaces/useCaseInterfaces/client/review/IaddReviewUseCase";
import { HttpStatus } from "../../../../domain/enums/httpStatus";
import { IshowReviewsUseCase } from "../../../../domain/interfaces/useCaseInterfaces/client/review/IshowReviewsUseCase";
import { Messages } from "../../../../domain/enums/messages";

export class ReviewController {
    private addReviewUseCase: IaddReviewUseCase
    private showReviewsUseCase:IshowReviewsUseCase
    constructor(addReviewUseCase: IaddReviewUseCase,showReviewsUseCase:IshowReviewsUseCase) {
        this.addReviewUseCase = addReviewUseCase
        this.showReviewsUseCase=showReviewsUseCase
    }
    async handleAddReview(req: Request, res: Response): Promise<void> {
        try {
            const { review } = req.body
            await this.addReviewUseCase.addReview(review)
            res.status(HttpStatus.CREATED).json({ message: Messages.REVIEW_ADDED })
        } catch (error) {
            console.log('error while adding review', error)
            res.status(HttpStatus.BAD_REQUEST).json({
                message: Messages.ERROR_ADDING_REVIEW,
                error: error instanceof Error ? error.message : Messages.ERROR_ADDING_REVIEW
            })
        }
    }
    async handleShowReview(req: Request, res: Response): Promise<void> {
        try {
            const { targetId, pageNo, rating } = req.query
            if (!targetId) {
                res.status(HttpStatus.BAD_REQUEST).json({ error: Messages.NO_TARGET_ID })
                return
            }
            const page = parseInt(pageNo as string, 10) || 1
            const ratingForFetching = parseInt(rating as string, 10) || 5
            const { reviews, totalPages } = await this.showReviewsUseCase.showReviews(targetId?.toString(), page, ratingForFetching)
            res.status(HttpStatus.OK).json({ message: Messages.REVIEWS_FETCHED, reviews, totalPages })
        } catch (error) {
            console.log('error while showing revies', error)
            res.status(HttpStatus.BAD_REQUEST).json({
                message: Messages.ERROR_SHOWING_REVIEWS,
                error: error instanceof Error ? error.message : Messages.ERROR_SHOWING_REVIEWS
            })
        }
    }
}