import { BookingListingVendorDTO } from "../../../../dto/bookings/bookingListingVendorDTO"

export interface IshowBookingsInVendorUseCase {
    showBookingsInVendor(vendorId: string, pageNo: number): Promise<{ Bookings: BookingListingVendorDTO[], totalPages: number }>
}