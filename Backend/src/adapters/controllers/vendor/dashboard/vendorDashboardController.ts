import { Request, Response } from "express";
import { IvendorDashboardUseCase } from "../../../../domain/interfaces/useCaseInterfaces/vendor/dashboard/IvendorDashboardUseCase";
import { HttpStatus } from "../../../../domain/enums/httpStatus";
import { Period } from "../../../../domain/types/PeriodType";
import { IpdfGenerateVendorUseCase } from "../../../../domain/interfaces/useCaseInterfaces/vendor/dashboard/IpdfGenerateVendorUseCase";
import { handleErrorResponse,logError } from "../../../../framework/services/errorHandler";

export class VendorDashboardController {
    private vendorDashboardUseCase: IvendorDashboardUseCase
    private pdfGenerateVendorUseCase:IpdfGenerateVendorUseCase
    constructor(vendorDashboardUseCase: IvendorDashboardUseCase,pfdGenerateVendorUseCase:IpdfGenerateVendorUseCase) {
        this.vendorDashboardUseCase = vendorDashboardUseCase
        this.pdfGenerateVendorUseCase=pfdGenerateVendorUseCase
    }
    async handleVendorDashboard(req: Request, res: Response): Promise<void> {
        try {
            const { vendorId, datePeriod } = req.query
            const { recentBookings, recentEvents, revenueChart, totalBookings, totalEvents, totalRevenue,totalTickets} = await this.vendorDashboardUseCase.findVendorDashBoardDetails(vendorId as string, datePeriod as Period)
            res.status(HttpStatus.OK).json({ message: 'Vendor dashboard details fetched', recentBookings, recentEvents, revenueChart, totalBookings, totalEvents, totalRevenue,totalTickets})
        } catch (error) {
            logError('Error while fetching vendor dashboard details', error);
            handleErrorResponse(req, res, error, 'Error while fetching vendor dashboard details');
        }
    }
    async handlePdfDownloaderVendor(req: Request, res: Response): Promise<void> {
        try {
            const { vendorId } = req.body
            const pdf = await this.pdfGenerateVendorUseCase.execute(vendorId)
            res.setHeader("Content-Type", "application/pdf");
            res.setHeader("Content-Disposition", "attachment; filename=vendor-report.pdf");
            res.send(pdf);
        } catch (error) {
            logError('Error while generating PDF report for vendor', error);
            handleErrorResponse(req, res, error, 'Error while downloading the PDF report');
        }
    }
}