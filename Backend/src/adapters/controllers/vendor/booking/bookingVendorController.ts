import { Request, Response } from "express";
import { IshowBookingsInVendorUseCase } from "../../../../domain/interfaces/useCaseInterfaces/vendor/bookings/IshowBookingsVendorUseCase";
import { HttpStatus } from "../../../../domain/enums/httpStatus";
import { IapproveBookingVendorUseCase } from "../../../../domain/interfaces/useCaseInterfaces/vendor/bookings/IapproveBookingVendorUseCase";
import { IrejectBookingVendorUseCase } from "../../../../domain/interfaces/useCaseInterfaces/vendor/bookings/IrejectBookingVendorUseCase";
import { IupdateBookingAsCompleteUseCase } from "../../../../domain/interfaces/useCaseInterfaces/vendor/bookings/IupdateBookingAsCompleteUseCase";

export class BookingsVendorController {
    private showBookingsInVendorUseCase: IshowBookingsInVendorUseCase
    private approveBookingVendorUseCase:IapproveBookingVendorUseCase
    private rejectBookingVendorUseCase:IrejectBookingVendorUseCase
    private updateBookingAsCompleteUseCase:IupdateBookingAsCompleteUseCase
    constructor(showBookingsInVendorUseCase: IshowBookingsInVendorUseCase,approveBookingVendorUseCase:IapproveBookingVendorUseCase,
        rejectBookingVendorUseCase:IrejectBookingVendorUseCase,updateBookingAsCompleteUseCase:IupdateBookingAsCompleteUseCase) {
        this.showBookingsInVendorUseCase = showBookingsInVendorUseCase
        this.approveBookingVendorUseCase=approveBookingVendorUseCase
        this.rejectBookingVendorUseCase=rejectBookingVendorUseCase
        this.updateBookingAsCompleteUseCase=updateBookingAsCompleteUseCase
    }
    async handleShowBookingsInVendor(req: Request, res: Response): Promise<void> {
        try {
            const { vendorId, pageNo } = req.params
            const page = parseInt(pageNo, 10) || 1
            const { Bookings, totalPages } = await this.showBookingsInVendorUseCase.showBookingsInVendor(vendorId, page)
            res.status(HttpStatus.OK).json({ message: "Bookings fetched", Bookings, totalPages })
        } catch (error) {
            console.log('error while fetching bookigns for vendorSide', error)
            res.status(HttpStatus.BAD_REQUEST).json({
                message: 'error while fetching bookigns for vendorSide',
                error: error instanceof Error ? error.message : 'error while fetching bookigns for vendorSide'
            })
        }
    }
    async handleApproveBooking(req: Request, res: Response): Promise<void> {
        try {
            const { bookingId } = req.body
            const changeStatus = await this.approveBookingVendorUseCase.approveBooking(bookingId)
            if (changeStatus) res.status(HttpStatus.OK).json({ message: "Vendor Approved" })
        } catch (error) {
            console.log('error while changing the status of the booking', error)
            res.status(HttpStatus.BAD_REQUEST).json({
                message: 'error while changing the status of the booking',
                error: error instanceof Error ? error.message : 'error while changing the status of the booking'
            })
        }
    }
    async handleRejectBookingInVendor(req: Request, res: Response): Promise<void> {
        try {
            const { bookingId,rejectionReason } = req.body 
            const rejectedBooking = await this.rejectBookingVendorUseCase.rejectBooking(bookingId,rejectionReason)
                if(rejectedBooking){
                    res.status(HttpStatus.OK).json({message:'Rejected booking'})
                }
        } catch (error) {
            console.log('error while rejecting booking', error)
            res.status(HttpStatus.BAD_REQUEST).json({
                message: 'error while rejectig booking',
                error: error instanceof Error ? error.message : 'error while rejecting booking'
            })
        }
    }
    async handleUpdateBookingComplete(req: Request, res: Response): Promise<void> {
        try {
            const { bookingId, status } = req.body
            const updateBooking = await this.updateBookingAsCompleteUseCase.changeStatusOfBooking(bookingId, status)
            res.status(HttpStatus.OK).json({ message: "Booking marked as completed" })
        } catch (error) {
            console.log('error while updating complete status of booking', error)
            res.status(HttpStatus.BAD_REQUEST).json({
                message: 'error while updating complete status of booking',
                error: error instanceof Error ? error.message : 'error while updating complete status of booking'
            })
        }
    }
}