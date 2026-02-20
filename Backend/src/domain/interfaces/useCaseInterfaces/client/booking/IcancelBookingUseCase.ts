import { BookingEntity } from "../../../../entities/bookingEntity";

export interface IcancelBookingUseCase {
    cancelBooking(bookingId: string): Promise<BookingEntity>
}