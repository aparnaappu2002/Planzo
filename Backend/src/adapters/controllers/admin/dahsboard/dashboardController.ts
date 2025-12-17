import { Request, Response } from "express";
import { IdashBoardDataUseCase } from "../../../../domain/interfaces/useCaseInterfaces/admin/dashboard/IdashboardDataUseCase";
import { HttpStatus } from "../../../../domain/enums/httpStatus";
import { IeventGraphUseCase } from "../../../../domain/interfaces/useCaseInterfaces/admin/dashboard/IeventGraphUseCase";
import { Messages } from "../../../../domain/enums/messages";

export class DashboardAdminController {
    private adminDashBoardUseCase: IdashBoardDataUseCase
    private eventGraphUseCase: IeventGraphUseCase
    constructor(adminDashBoardUseCase: IdashBoardDataUseCase, eventGraphUseCase: IeventGraphUseCase) {
        this.adminDashBoardUseCase = adminDashBoardUseCase
        this.eventGraphUseCase = eventGraphUseCase
    }
    async handleAdminDashboardata(req: Request, res: Response): Promise<void> {
        try {
            const { adminId } = req.query
            const eventDetailsForGraph = await this.eventGraphUseCase.eventGraphDetails()
            const { bookings, events, totalBookings, totalClients, totalRevenue, totalVendors } = await this.adminDashBoardUseCase.dashBoardDetails(adminId as string)
            res.status(HttpStatus.OK).json({ message: Messages.DASHBOARD_DATA_FETCHED , bookings, events, totalBookings, totalClients, totalRevenue, totalVendors, eventDetailsForGraph })
        } catch (error) {
            //console.log('error while fetching admin dashboard data', error)
            res.status(HttpStatus.BAD_REQUEST).json({
                message: Messages.DASHBOARD_DATA_ERROR,
                error: error instanceof Error ? error.message : Messages.DASHBOARD_DATA_ERROR
            })
        }
    }
}