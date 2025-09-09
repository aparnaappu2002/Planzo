import { BookingEntity } from "../../../domain/entities/bookingEntity";
import { IbookingRepository } from "../../../domain/interfaces/repositoryInterfaces/booking/IbookingRepository";
import { IcreateBookingUseCase } from "../../../domain/interfaces/useCaseInterfaces/client/booking/IcreateBookingUseCase";

export class CreateBookingUseCase implements IcreateBookingUseCase {
    private bookingDatabase: IbookingRepository
    constructor(bookingDatabase: IbookingRepository) {
        this.bookingDatabase = bookingDatabase
    }
    async createBooking(booking: BookingEntity): Promise<BookingEntity> {
        const existingBooking = await this.bookingDatabase.findBookingInSameDate(booking.clientId.toString(), booking.serviceId.toString(), booking.date)
        if (existingBooking) throw new Error('There is already a booking in same date')
        return await this.bookingDatabase.createBooking(booking)
    }
}