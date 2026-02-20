import { BookingListingVendorDTO } from "../../../domain/dto/bookings/bookingListingVendorDTO";
import { IbookingRepository } from "../../../domain/interfaces/repositoryInterfaces/booking/IbookingRepository";
import { IshowBookingsInVendorUseCase } from "../../../domain/interfaces/useCaseInterfaces/vendor/bookings/IshowBookingsVendorUseCase";
import { mapBookingVendorEntityToDTO } from "../../mappers/bookingVendorMapper";

export class ShowBookingsInVendorUseCase implements IshowBookingsInVendorUseCase {
    private bookingDatabase: IbookingRepository
    constructor(bookingDatabase: IbookingRepository) {
        this.bookingDatabase = bookingDatabase
    }
    async showBookingsInVendor(vendorId: string,pageNo:number): Promise<{ Bookings: BookingListingVendorDTO[], totalPages: number }> {
        const {Bookings,totalPages}= await this.bookingDatabase.showBookingsInVendor(vendorId,pageNo)
        return {
            Bookings: Bookings.map(mapBookingVendorEntityToDTO),
            totalPages
        };


    }
}