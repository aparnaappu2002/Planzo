import { ObjectId } from "mongoose";
import { BookingEntity } from "../../../entities/bookingEntity";
import { BookingsInClientEntity } from "../../../entities/bookingsInClientEntity";


export interface IbookingRepository {
    createBooking(booking: BookingEntity): Promise<BookingEntity>
    findBookingInSameDate(clientId: string, serviceId: string, dates: Date[]): Promise<boolean>
    showBookingsInClient(clientId: string, pageNo: number): Promise<{ Bookings: BookingsInClientEntity[] | [], totalPages: number }>
}