import { IbookingRepository } from "../../../domain/interfaces/repositoryInterfaces/booking/IbookingRepository";
import { IrejectBookingVendorUseCase } from "../../../domain/interfaces/useCaseInterfaces/vendor/bookings/IrejectBookingVendorUseCase";

export class RejectBookingInVendorUseCase implements IrejectBookingVendorUseCase {
    private bookingDatabase: IbookingRepository
    constructor(bookingDatabase: IbookingRepository) {
        this.bookingDatabase = bookingDatabase
    }
    async rejectBooking(bookingId: string, rejectionReason: string): Promise<boolean> {
        const rejectedBooking = await this.bookingDatabase.rejectBooking(bookingId,rejectionReason)
        if (!rejectedBooking) throw new Error('There is no booking in this Booking Id')
        return true
    }
}