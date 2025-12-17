import { ObjectId } from "mongoose";
import { ServiceBookingDTO } from "../dto/serviceBookingDTO";
import { VendorDTO } from "../dto/VendorDTO";

export interface BookingsInClientEntity {
    _id: string | ObjectId
    date: Date
    paymentStatus: "Pending" | "Failed" | "Successfull" | "Refunded",
    vendorApproval: "Pending" | "Approved" | "Rejected",
    email: string,
    phone: number,
    status: "Pending" | "Rejected" | "Completed",
    rejectionReason?:string,
    vendor: VendorDTO,
    service: ServiceBookingDTO
}