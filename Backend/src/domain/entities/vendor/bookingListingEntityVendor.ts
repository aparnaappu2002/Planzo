import { ObjectId } from "mongoose"
import { ClientDTO } from "../../dto/ClientDTO"
import { ServiceBookingDTO } from "../../dto/serviceBookingDTO"

export interface BookingListingEntityVendor {
    _id: string | ObjectId
    date: Date
    paymentStatus: "Pending" | "Failed" | "Successfull" | "Refunded",
    vendorApproval: "Pending" | "Approved" | "Rejected",
    email: string,
    phone: number,
    status: "Pending" | "Rejected" | "Completed",
    rejectionReason?:string
    client: ClientDTO,
    service: ServiceBookingDTO,
}