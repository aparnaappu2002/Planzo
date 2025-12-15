import { PopulatedBookingForAdmin } from "../../../domain/dto/bookingDetailsAdminDTO";
import { EventEntity } from "../../../domain/entities/event/eventEntity";
import { IbookingRepository } from "../../../domain/interfaces/repositoryInterfaces/booking/IbookingRepository";
import { IClientDatabaseRepository } from "../../../domain/interfaces/repositoryInterfaces/client/clientDatabaseRepository";
import { IeventRepository } from "../../../domain/interfaces/repositoryInterfaces/event/IeventRepository";
import { IvendorDatabaseRepositoryInterface } from "../../../domain/interfaces/repositoryInterfaces/vendor/vendorDatabaseRepository";
import { IwalletRepository } from "../../../domain/interfaces/repositoryInterfaces/wallet/IwalletRepository";
import { IdashBoardDataUseCase } from "../../../domain/interfaces/useCaseInterfaces/admin/dashboard/IdashboardDataUseCase";

export class DashBoardDetailsUseCase implements IdashBoardDataUseCase {
    private walletDatabase: IwalletRepository
    private vendorDatabase: IvendorDatabaseRepositoryInterface
    private clientDatabse: IClientDatabaseRepository
    private bookingDatabase: IbookingRepository
    private eventRepository: IeventRepository
    constructor(walletDatabase: IwalletRepository, vendorDatabase: IvendorDatabaseRepositoryInterface, clientDatabse: IClientDatabaseRepository, bookingDatabase: IbookingRepository, eventRepository: IeventRepository) {
        this.walletDatabase = walletDatabase
        this.vendorDatabase = vendorDatabase
        this.clientDatabse = clientDatabse
        this.bookingDatabase = bookingDatabase
        this.eventRepository = eventRepository
    }
    async dashBoardDetails(adminId: string): Promise<{ bookings: PopulatedBookingForAdmin[] | []; events: EventEntity[] | []; totalVendors: number; totalClients: number; totalRevenue: number; totalBookings: number; }> {
        const { bookings } = await this.bookingDatabase.showAllBookingsInAdmin(1)
        const { events } = await this.eventRepository.listingEventsInAdminSide(1)
        const totalVendors = await this.vendorDatabase.findTotalVendor()
        const totalClients = await this.clientDatabse.totalClient()
        const totalRevenue = await this.walletDatabase.findTotalAmount(adminId)
        if (!totalRevenue) throw new Error('No wallet found in this admin id')
        const totalBookings = await this.bookingDatabase.findTotalBookings()
        return { bookings, events, totalVendors, totalClients, totalRevenue, totalBookings }
    }
}