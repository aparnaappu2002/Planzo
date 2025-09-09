import { ObjectId } from "mongoose";

export interface ReviewEntity {
    _id?: ObjectId | string
    reviewerId: ObjectId | string;
    targetId: ObjectId | string;
    targetType: 'service' | 'event';
    rating: number;
    comment: string;
}