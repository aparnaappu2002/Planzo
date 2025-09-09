import { Schema, Types } from "mongoose";
import { ReviewEntity } from "../../../domain/entities/reviewEntity";

export const reviewSchema = new Schema<ReviewEntity>({
    comment: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        min: 1,
        max: 5
    },
    reviewerId: {
        type: Types.ObjectId,
        required: true,
        ref: 'client'
    },
    targetType: {
        type: String,
        enum: ['service', 'event'],
        required: true
    },
    targetId: {
        type: Types.ObjectId,
        required: true,
        refPath: 'targetType'

    }
}, {
    timestamps: true
})