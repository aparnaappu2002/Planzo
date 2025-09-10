import { ObjectId } from "mongoose";
import { BookingEntity } from "../../../entities/bookingEntity";
import { BookingsInClientEntity } from "../../../entities/bookingsInClientEntity";
import { BookingListingEntityVendor } from "../../../entities/vendor/bookingListingEntityVendor";


export interface IbookingRepository {
    createBooking(booking: BookingEntity): Promise<BookingEntity>
    findBookingInSameDate(clientId: string, serviceId: string, dates: Date[]): Promise<boolean>
    showBookingsInClient(clientId: string, pageNo: number): Promise<{ Bookings: BookingsInClientEntity[] | [], totalPages: number }>
    showBookingsInVendor(vendorId: string, pageNo: number): Promise<{ Bookings: BookingListingEntityVendor[] | [], totalPages: number }>
    approveBooking(bookingId: string): Promise<BookingEntity | null>
    findBookingByIdForDateChecking(bookingId: string): Promise<BookingEntity | null>
    findBookingWithSameDate(bookingId: string, vendorId: string, date: Date[]): Promise<BookingEntity | null>
    rejectBooking(bookingId: string, rejectionReasoneason: string): Promise<BookingEntity | null>
    changeStatus(bookingId: string, status: string): Promise<BookingEntity | null>
}