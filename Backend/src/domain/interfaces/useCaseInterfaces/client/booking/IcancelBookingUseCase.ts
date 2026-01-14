import { CancelBookingClientDTO } from "../../../../dto/client/booking/cancelBookingClientDTO";

export interface IcancelBookingUseCase {
    cancelBooking(bookingId: string): Promise<CancelBookingClientDTO>
}