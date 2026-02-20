import { BookingsInClientEntity } from "../../domain/entities/bookingsInClientEntity";
import { BookingsInClientDTO } from "../../domain/dto/bookings/bookingsInClientDTO";

export const mapBookingsInClientEntityToDTO = (
  booking: BookingsInClientEntity
): BookingsInClientDTO => ({
  bookingId: booking._id.toString(),
  date: booking.date,
  paymentStatus: booking.paymentStatus,
  vendorApproval: booking.vendorApproval,
  email: booking.email,
  phone: booking.phone,
  status: booking.status,
  rejectionReason: booking.rejectionReason,
  vendor: booking.vendor,
  service: booking.service
});
