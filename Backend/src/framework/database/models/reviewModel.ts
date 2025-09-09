import { Document, model, ObjectId } from "mongoose";
import { ReviewEntity } from "../../../domain/entities/reviewEntity";
import { reviewSchema } from "../schema/reviewSchema";

export interface IreviewModel extends Omit<ReviewEntity, '_id'>, Document {
    _id: ObjectId
}

export const reviewModel=model('review',reviewSchema)