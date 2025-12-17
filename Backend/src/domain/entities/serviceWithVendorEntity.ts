import { ObjectId } from "mongoose";
import { VendorDTO } from "../dto/VendorDTO";

export interface ServiceWithVendorEntity {
    _id: string | ObjectId;
    serviceTitle: string;
    serviceDescription: string;
    price: number;
    vendor: VendorDTO;
    duration: string
}
