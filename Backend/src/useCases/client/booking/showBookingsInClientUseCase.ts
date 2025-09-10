import { BookingsInClientEntity } from "../../../domain/entities/bookingsInClientEntity";
import { IbookingRepository } from "../../../domain/interfaces/repositoryInterfaces/booking/IbookingRepository";
import { IshowBookingsInClientUseCase } from "../../../domain/interfaces/useCaseInterfaces/client/booking/IshowBookingInClientUseCase";

export class ShowBookingsInClientUseCase implements IshowBookingsInClientUseCase {
    private bookingsDatabase: IbookingRepository
    constructor(bookingsDatabase: IbookingRepository) {
        this.bookingsDatabase = bookingsDatabase
    }
    async findBookings(clientId: string, pageNo: number): Promise<{ Bookings: BookingsInClientEntity[] | [], totalPages: number }> {
        return await this.bookingsDatabase.showBookingsInClient(clientId, pageNo)
    }
}