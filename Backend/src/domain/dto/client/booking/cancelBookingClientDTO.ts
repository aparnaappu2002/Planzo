export interface CancelBookingClientDTO {
  bookingId: string
  serviceId: string
  clientId: string
  vendorId: string
  status: "Cancelled"
  paymentStatus: "Pending" | "Failed" | "Successfull" | "Refunded"
  vendorApproval: "Pending" | "Approved" | "Rejected"
  rejectionReason?: string
  isComplete: boolean
  createdAt: Date
}
