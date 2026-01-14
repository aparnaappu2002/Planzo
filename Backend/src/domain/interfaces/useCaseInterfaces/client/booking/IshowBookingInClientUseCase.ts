import { BookingsInClientDTO } from "../../../../dto/bookings/bookingsInClientDTO"

export interface IshowBookingsInClientUseCase {
    findBookings(clientId: string, pageNo: number): Promise<{ bookings: BookingsInClientDTO[], totalPages: number }>
}