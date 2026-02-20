import { ClientDTO } from "../ClientDTO";
import { ServiceBookingDTO } from "../serviceBookingDTO";

export interface BookingListingVendorDTO {
    _id: string;
    date: Date;
    paymentStatus: "Pending" | "Failed" | "Successfull" | "Refunded";
    vendorApproval: "Pending" | "Approved" | "Rejected";
    email: string;
    phone: number;
    status: "Pending" | "Rejected" | "Completed";
    rejectionReason?: string;
    client: ClientDTO;
    service: ServiceBookingDTO;
}