import { Document, model, ObjectId } from "mongoose";
import { chatEntity } from "../../../domain/entities/chat/chatEntity";
import { chatSchema } from "../schema/chatSchema";

export interface IchatModel extends Omit<chatEntity, '_id'>, Document {
    _id: ObjectId
}

export const chatModel = model('chat', chatSchema)