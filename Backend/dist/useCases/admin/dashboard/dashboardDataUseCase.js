"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashBoardDetailsUseCase = void 0;
class DashBoardDetailsUseCase {
    constructor(walletDatabase, vendorDatabase, clientDatabse, bookingDatabase, eventRepository) {
        this.walletDatabase = walletDatabase;
        this.vendorDatabase = vendorDatabase;
        this.clientDatabse = clientDatabse;
        this.bookingDatabase = bookingDatabase;
        this.eventRepository = eventRepository;
    }
    dashBoardDetails(adminId) {
        return __awaiter(this, void 0, void 0, function* () {
            const { bookings } = yield this.bookingDatabase.showAllBookingsInAdmin(1);
            const { events } = yield this.eventRepository.listingEventsInAdminSide(1);
            const totalVendors = yield this.vendorDatabase.findTotalVendor();
            const totalClients = yield this.clientDatabse.totalClient();
            const totalRevenue = yield this.walletDatabase.findTotalAmount(adminId);
            if (!totalRevenue)
                throw new Error('No wallet found in this admin id');
            const totalBookings = yield this.bookingDatabase.findTotalBookings();
            return { bookings, events, totalVendors, totalClients, totalRevenue, totalBookings };
        });
    }
}
exports.DashBoardDetailsUseCase = DashBoardDetailsUseCase;
