import { IbookingRepository } from "../../../domain/interfaces/repositoryInterfaces/booking/IbookingRepository";
import { IshowBookingsInClientUseCase } from "../../../domain/interfaces/useCaseInterfaces/client/booking/IshowBookingInClientUseCase";
import { BookingsInClientDTO } from "../../../domain/dto/bookings/bookingsInClientDTO";
import { mapBookingsInClientEntityToDTO } from "../../../domain/dto/bookings/bookingMapper";

export class ShowBookingsInClientUseCase implements IshowBookingsInClientUseCase {
    private bookingsDatabase: IbookingRepository
    constructor(bookingsDatabase: IbookingRepository) {
        this.bookingsDatabase = bookingsDatabase
    }
    async findBookings(clientId: string, pageNo: number): Promise<{ bookings: BookingsInClientDTO[], totalPages: number }> {
        const { Bookings, totalPages } =
            await this.bookingsDatabase.showBookingsInClient(clientId, pageNo);

        return {
            bookings: Bookings.map(mapBookingsInClientEntityToDTO),
            totalPages
        };

    }
}