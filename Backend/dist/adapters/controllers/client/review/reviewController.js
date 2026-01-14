"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewController = void 0;
const httpStatus_1 = require("../../../../domain/enums/httpStatus");
const messages_1 = require("../../../../domain/enums/messages");
class ReviewController {
    constructor(addReviewUseCase, showReviewsUseCase) {
        this.addReviewUseCase = addReviewUseCase;
        this.showReviewsUseCase = showReviewsUseCase;
    }
    handleAddReview(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { review } = req.body;
                yield this.addReviewUseCase.addReview(review);
                res.status(httpStatus_1.HttpStatus.CREATED).json({ message: messages_1.Messages.REVIEW_ADDED });
            }
            catch (error) {
                console.log('error while adding review', error);
                res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({
                    message: messages_1.Messages.ERROR_ADDING_REVIEW,
                    error: error instanceof Error ? error.message : messages_1.Messages.ERROR_ADDING_REVIEW
                });
            }
        });
    }
    handleShowReview(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { targetId, pageNo, rating } = req.query;
                if (!targetId) {
                    res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({ error: messages_1.Messages.NO_TARGET_ID });
                    return;
                }
                const page = parseInt(pageNo, 10) || 1;
                const ratingForFetching = parseInt(rating, 10) || 5;
                const { reviews, totalPages } = yield this.showReviewsUseCase.showReviews(targetId === null || targetId === void 0 ? void 0 : targetId.toString(), page, ratingForFetching);
                res.status(httpStatus_1.HttpStatus.OK).json({ message: messages_1.Messages.REVIEWS_FETCHED, reviews, totalPages });
            }
            catch (error) {
                console.log('error while showing revies', error);
                res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({
                    message: messages_1.Messages.ERROR_SHOWING_REVIEWS,
                    error: error instanceof Error ? error.message : messages_1.Messages.ERROR_SHOWING_REVIEWS
                });
            }
        });
    }
}
exports.ReviewController = ReviewController;
