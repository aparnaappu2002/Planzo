import { IbookingRepository } from "../../../domain/interfaces/repositoryInterfaces/booking/IbookingRepository";
import { IupdateBookingAsCompleteUseCase } from "../../../domain/interfaces/useCaseInterfaces/vendor/bookings/IupdateBookingAsCompleteUseCase";

export class UpdateBookingAsCompleteUseCase implements IupdateBookingAsCompleteUseCase {
    private bookingDatabase: IbookingRepository
    constructor(bookingDatabase: IbookingRepository) {
        this.bookingDatabase = bookingDatabase
    }
    async changeStatusOfBooking(bookingId: string, status: string): Promise<boolean> {
        if (!bookingId || bookingId.trim().length === 0) {
            throw new Error('Booking ID is required');
        }
        if (!status || status.trim().length === 0) {
            throw new Error('Status is required');
        }
        
        const changeBookingStatus = await this.bookingDatabase.changeStatus(bookingId, status)
        if (!changeBookingStatus) throw new Error('No booking found in this Id')
        return true
    }
}