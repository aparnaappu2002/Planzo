import { BookingListingEntityVendor } from "../../../../entities/vendor/bookingListingEntityVendor"

export interface IshowBookingsInVendorUseCase {
    showBookingsInVendor(vendorId: string, pageNo: number): Promise<{ Bookings: BookingListingEntityVendor[] | [], totalPages: number }>
}