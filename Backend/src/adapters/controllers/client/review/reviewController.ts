import { Request, Response } from "express";
import { IaddReviewUseCase } from "../../../../domain/interfaces/useCaseInterfaces/client/review/IaddReviewUseCase";
import { HttpStatus } from "../../../../domain/enums/httpStatus";
import { IshowReviewsUseCase } from "../../../../domain/interfaces/useCaseInterfaces/client/review/IshowReviewsUseCase";
import { Messages } from "../../../../domain/enums/messages";
import { handleErrorResponse,logInfo,logError } from "../../../../framework/services/errorHandler";

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
            logInfo(`Adding review for target: ${review?.targetId || 'unknown'}`);
            await this.addReviewUseCase.addReview(review)
            logInfo(`Review added successfully for target: ${review?.targetId || 'unknown'}`);
            res.status(HttpStatus.CREATED).json({ message: Messages.REVIEW_ADDED })
        } catch (error) {
            logError('Error while adding review', error);
            handleErrorResponse(req, res, error, Messages.ERROR_ADDING_REVIEW);
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
            logInfo(`Reviews fetched successfully for targetId: ${targetId}, found ${reviews.length} reviews`);
            res.status(HttpStatus.OK).json({ message: Messages.REVIEWS_FETCHED, reviews, totalPages })
        } catch (error) {
            logError('Error while showing reviews', error);
            handleErrorResponse(req, res, error, Messages.ERROR_SHOWING_REVIEWS);
        }
    }
}