import { EventEntity } from "../../../../entities/event/eventEntity"
import { BookingListingEntityVendor } from "../../../../entities/vendor/bookingListingEntityVendor"
import { Revenue } from "../../../../entities/dashboard/revenueEntity"
import { Period } from "../../../../types/PeriodType"

export interface IvendorDashboardUseCase {
    findVendorDashBoardDetails(vendorId: string, Period: Period): Promise<{ revenueChart: Revenue[], totalBookings: number, totalEvents: number, recentEvents: EventEntity[], recentBookings: BookingListingEntityVendor[], totalRevenue: number, totalTickets: number }>
}