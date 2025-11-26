import { Request, Response } from "express";
import { IcreateBookingUseCase } from "../../../../domain/interfaces/useCaseInterfaces/client/booking/IcreateBookingUseCase";
import { HttpStatus } from "../../../../domain/entities/httpStatus";
import { BookingEntity } from "../../../../domain/entities/bookingEntity";
import { IshowServiceWithVendorUseCase } from "../../../../domain/interfaces/useCaseInterfaces/client/booking/IshowServiceWithVendorUseCase";
import { IshowBookingsInClientUseCase } from "../../../../domain/interfaces/useCaseInterfaces/client/booking/IshowBookingInClientUseCase";
import { IcreateBookingPaymentUseCase } from "../../../../domain/interfaces/useCaseInterfaces/client/booking/IcreateBookingPaymentUseCase";
import { IconfirmBookingPaymentUseCase } from "../../../../domain/interfaces/useCaseInterfaces/client/booking/IconfirmBookingPaymentUseCase";
import { IcancelBookingUseCase } from "../../../../domain/interfaces/useCaseInterfaces/client/booking/IcancelBookingUseCase";


export class BookingClientController {
    private showServiceWithVendorUseCase:IshowServiceWithVendorUseCase
    private createBookingUseCase: IcreateBookingUseCase
    private showBookingsInClient:IshowBookingsInClientUseCase
    private createBookingPaymentUseCase:IcreateBookingPaymentUseCase
    private confirmBookingPaymentUseCase:IconfirmBookingPaymentUseCase
    private cancelBookingUseCase:IcancelBookingUseCase
    
    constructor(showServiceWithVendorUseCase:IshowServiceWithVendorUseCase,createBookingUseCase: IcreateBookingUseCase,showBookingsInClient:IshowBookingsInClientUseCase,
        createBookingPaymentUseCase:IcreateBookingPaymentUseCase,confirmBookingPaymentUseCase:IconfirmBookingPaymentUseCase,cancelBookingUseCase:IcancelBookingUseCase
    ) {
        this.createBookingUseCase = createBookingUseCase
        this.showServiceWithVendorUseCase=showServiceWithVendorUseCase
        this.showBookingsInClient=showBookingsInClient
        this.createBookingPaymentUseCase=createBookingPaymentUseCase
        this.confirmBookingPaymentUseCase=confirmBookingPaymentUseCase
        this.cancelBookingUseCase=cancelBookingUseCase
    }
    async handleShowServiceWithVendor(req: Request, res: Response): Promise<void> {
        try {
            
            const { serviceId, pageNo, rating } = req.query
            if (!serviceId || !pageNo) {
                res.status(HttpStatus.BAD_REQUEST).json({ error: "No service id is provided" })
                return
            }
            const page = parseInt(pageNo?.toString(), 10) || 1
            const { reviews, service, totalPages } = await this.showServiceWithVendorUseCase.showServiceWithVendorUseCase(serviceId.toString(), page)
            res.status(HttpStatus.OK).json({ message: "service with vendor fetched", serviceWithVendor: service, reviews, totalPages })
        } catch (error) {
            console.log('error while fetching the service data with venodor', error)
            res.status(HttpStatus.BAD_REQUEST).json({
                message: 'error while fetching the service data with venodor',
                error: error instanceof Error ? error.message : 'error while fetching the service data with venodor'
            })
        }
    }
    async handleCreateBooking(req: Request, res: Response): Promise<void> {
        try {
            const booking: BookingEntity = req.body.booking
            const createdBooking = await this.createBookingUseCase.createBooking(booking)
            console.log(createdBooking)
            if (!createdBooking) res.status(HttpStatus.BAD_REQUEST).json({ message: "error while creating booking" })
            res.status(HttpStatus.OK).json({ message: "Booking created", createdBooking })
        } catch (error) {
            console.log('error while creating booking', error)
            res.status(HttpStatus.BAD_REQUEST).json({
                message: 'error while creating booking',
                error: error instanceof Error ? error.message : 'error while creating booking'
            })
        }
    }
    async handleShowBookingsInClient(req: Request, res: Response): Promise<void> {
        try {
            const { clientId, pageNo } = req.params
            console.log("Params:",req.params)
            const page = parseInt(pageNo, 10) || 1
            const { Bookings, totalPages } = await this.showBookingsInClient.findBookings(clientId, page)
            console.log("Bookings:",Bookings)
            res.status(HttpStatus.OK).json({ message: 'Bookings fetched', Bookings, totalPages })
        } catch (error) {
            console.log('error while fetching bookings in client', error)
            res.status(HttpStatus.BAD_REQUEST).json({
                message: 'error while fetching bookings in client',
                error: error instanceof Error ? error.message : 'error while fetching bookings in client'
            })
        }
    }
    async handleCreateBookingPayment(req: Request, res: Response): Promise<void> {
        try {
            const { bookingId, paymentIntentId } = req.body
            const { clientStripeId, booking } = await this.createBookingPaymentUseCase.inititateBookingPayment(bookingId, paymentIntentId)
            res.status(HttpStatus.OK).json({ message: "Payment inititaion done", clientStripeId, booking })
        } catch (error) {
            console.log('error while initiating booking payment', error)
            res.status(HttpStatus.BAD_REQUEST).json({
                message: "error while initiating booking payment",
                error: error instanceof Error ? error.message : 'error while initiating booking payment'
            })
        }
    }
    async handleConfirmBookingPaymentUseCase(req: Request, res: Response): Promise<void> {
        try {
            const { booking, paymentIntentId } = req.body
            const ConfirmBooking = await this.confirmBookingPaymentUseCase.confirmBookingPayment(booking, paymentIntentId)
            res.status(HttpStatus.OK).json({message:"Payment confirm"})
        } catch (error) {
            console.log('error while confirming booking payment', error)
            res.status(HttpStatus.BAD_REQUEST).json({
                message: 'error while confirming booking payment',
                error: error instanceof Error ? error.message : 'error while confirming booking payment'
            })
        }
    }
    async handleCancelBooking(req: Request, res: Response): Promise<void> {
        try {
            const { bookingId } = req.body
            const cancelBooking = await this.cancelBookingUseCase.cancelBooking(bookingId)
            res.status(HttpStatus.OK).json({ message: "Booking cancelled", cancelBooking })
        } catch (error) {
            console.log('error while canceling the booking', error)
            res.status(HttpStatus.BAD_REQUEST).json({
                message: 'error while canceling the booking',
                error: error instanceof Error ? error.message : 'error while cancelling the booking'
            })
        }
    }
}