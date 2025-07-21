import { VendorSchema } from "../schema/vendorSchema";
import { VendorEntity } from "../../../domain/entities/vendorEntitty";
import { Document,model,ObjectId } from "mongoose";

export interface IvendorModel extends Omit<VendorEntity,'_id'>,Document{
    _id:ObjectId
}

export const VendorModel = model<VendorEntity>('vendors',VendorSchema)