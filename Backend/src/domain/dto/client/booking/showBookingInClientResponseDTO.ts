import { BookingsInClientDTO } from "./bookingInClientDTO"

export interface ShowBookingsInClientResponseDTO {
  bookings: BookingsInClientDTO[]
  totalPages: number
}
