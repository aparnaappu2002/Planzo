import { ObjectId } from "mongoose";
import { ServiceBookingDTO } from "./serviceBookingDTO";
import { VendorDTO } from "./VendorDTO";

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