import { VendorDTO } from "../VendorDTO";
import { ServiceBookingDTO } from "../serviceBookingDTO";

export interface BookingsInClientDTO {
  bookingId: string;
  date: Date;
  paymentStatus: "Pending" | "Failed" | "Successfull" | "Refunded";
  vendorApproval: "Pending" | "Approved" | "Rejected";
  email: string;
  phone: number;
  status: "Pending" | "Rejected" | "Completed";
  rejectionReason?: string;
  vendor: VendorDTO;
  service: ServiceBookingDTO;
}
