import { BookingsInClientEntity } from "../../../../entities/bookingsInClientEntity"

export interface IshowBookingsInClientUseCase {
    findBookings(clientId: string, pageNo: number): Promise<{ Bookings: BookingsInClientEntity[] | [], totalPages: number }>
}