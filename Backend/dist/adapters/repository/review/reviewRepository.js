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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewRepository = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const reviewModel_1 = require("../../../framework/database/models/reviewModel");
class ReviewRepository {
    createReview(review) {
        return __awaiter(this, void 0, void 0, function* () {
            return reviewModel_1.reviewModel.create(review);
        });
    }
    findReviews(targetId, pageNo, rating) {
        return __awaiter(this, void 0, void 0, function* () {
            const page = Math.max(pageNo, 1);
            const limit = 3;
            const skip = (page - 1) * limit;
            const filter = {
                targetId: new mongoose_1.default.Types.ObjectId(targetId),
            };
            const reviews = yield reviewModel_1.reviewModel.find(Object.assign({}, filter)).populate('reviewerId', 'name profileImage').skip(skip).limit(limit).sort({ createdAt: -1 }).lean();
            const totalPages = Math.ceil((yield reviewModel_1.reviewModel.countDocuments({ targetId })) / limit);
            return { reviews, totalPages };
        });
    }
}
exports.ReviewRepository = ReviewRepository;
