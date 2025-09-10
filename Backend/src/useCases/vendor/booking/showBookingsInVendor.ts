import { BookingListingEntityVendor } from "../../../domain/entities/vendor/bookingListingEntityVendor";
import { IbookingRepository } from "../../../domain/interfaces/repositoryInterfaces/booking/IbookingRepository";
import { IshowBookingsInVendorUseCase } from "../../../domain/interfaces/useCaseInterfaces/vendor/bookings/IshowBookingsVendorUseCase";

export class ShowBookingsInVendorUseCase implements IshowBookingsInVendorUseCase {
    private bookingDatabase: IbookingRepository
    constructor(bookingDatabase: IbookingRepository) {
        this.bookingDatabase = bookingDatabase
    }
    async showBookingsInVendor(vendorId: string,pageNo:number): Promise<{ Bookings: BookingListingEntityVendor[] | [], totalPages: number }> {
        return await this.bookingDatabase.showBookingsInVendor(vendorId,pageNo)

    }
}