import { BookingEntity } from "../../../domain/entities/bookingEntity";
import { IbookingRepository } from "../../../domain/interfaces/repositoryInterfaces/booking/IbookingRepository";
import { IcancelBookingUseCase } from "../../../domain/interfaces/useCaseInterfaces/client/booking/IcancelBookingUseCase";

export class CancelBookingUseCase implements IcancelBookingUseCase {
    private bookingDatabase: IbookingRepository
    constructor(bookingDatabase: IbookingRepository) {
        this.bookingDatabase = bookingDatabase
    }
    async cancelBooking(bookingId: string): Promise<BookingEntity> {
        const cancelledBooking = await this.bookingDatabase.cancelBooking(bookingId)
        if (!cancelledBooking) throw new Error('No booking found in this ID')
        return cancelledBooking
    }
}