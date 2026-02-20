import { BookingListingEntityVendor } from "../../domain/entities/vendor/bookingListingEntityVendor";
import { BookingListingVendorDTO } from "../../domain/dto/bookings/bookingListingVendorDTO";

export const mapBookingVendorEntityToDTO = (booking: BookingListingEntityVendor): BookingListingVendorDTO => ({
    _id: booking._id.toString(),
    date: booking.date,
    paymentStatus: booking.paymentStatus,
    vendorApproval: booking.vendorApproval,
    email: booking.email,
    phone: booking.phone,
    status: booking.status,
    rejectionReason: booking.rejectionReason,
    client: booking.client,
    service: booking.service
});