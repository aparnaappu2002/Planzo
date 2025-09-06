import { Document, model, ObjectId } from "mongoose";
import { WorkSamplesEntity } from "../../../domain/entities/workSample/WorkSampleEntity";
import { workSampleSchema } from "../schema/workSampleSchema";

export interface IworkSampleModel extends Omit<WorkSamplesEntity, '_id'>, Document {
    _id: ObjectId
}

export const workSampleModel = model<WorkSamplesEntity>('workSample', workSampleSchema)