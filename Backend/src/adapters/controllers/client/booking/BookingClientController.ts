import { Request, Response } from "express";
import { IcreateBookingUseCase } from "../../../../domain/interfaces/useCaseInterfaces/client/booking/IcreateBookingUseCase";
import { HttpStatus } from "../../../../domain/enums/httpStatus";
import { BookingEntity } from "../../../../domain/entities/bookingEntity";
import { IshowServiceWithVendorUseCase } from "../../../../domain/interfaces/useCaseInterfaces/client/booking/IshowServiceWithVendorUseCase";
import { IshowBookingsInClientUseCase } from "../../../../domain/interfaces/useCaseInterfaces/client/booking/IshowBookingInClientUseCase";
import { IcreateBookingPaymentUseCase } from "../../../../domain/interfaces/useCaseInterfaces/client/booking/IcreateBookingPaymentUseCase";
import { IconfirmBookingPaymentUseCase } from "../../../../domain/interfaces/useCaseInterfaces/client/booking/IconfirmBookingPaymentUseCase";
import { IcancelBookingUseCase } from "../../../../domain/interfaces/useCaseInterfaces/client/booking/IcancelBookingUseCase";
import { Messages } from "../../../../domain/enums/messages";


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
                res.status(HttpStatus.BAD_REQUEST).json({ error: Messages.SERVICE_ID_REQUIRED })
                return
            }
            const page = parseInt(pageNo?.toString(), 10) || 1
            const { reviews, service, totalPages } = await this.showServiceWithVendorUseCase.showServiceWithVendorUseCase(serviceId.toString(), page)
            res.status(HttpStatus.OK).json({ message: Messages.SERVICE_FETCHED, serviceWithVendor: service, reviews, totalPages })
        } catch (error) {
            console.log('error while fetching the service data with venodor', error)
            res.status(HttpStatus.BAD_REQUEST).json({
                message: Messages.SERVICE_FETCH_ERROR,
                error: error instanceof Error ? error.message : Messages.SERVICE_FETCH_ERROR
            })
        }
    }
    async handleCreateBooking(req: Request, res: Response): Promise<void> {
        try {
            const booking: BookingEntity = req.body.booking
            const createdBooking = await this.createBookingUseCase.createBooking(booking)
            console.log(createdBooking)
            if (!createdBooking) res.status(HttpStatus.BAD_REQUEST).json({ message: Messages.BOOKING_CREATE_ERROR })
            res.status(HttpStatus.OK).json({ message: Messages.BOOKING_CREATED, createdBooking })
        } catch (error) {
            console.log('error while creating booking', error)
            res.status(HttpStatus.BAD_REQUEST).json({
                message: Messages.BOOKING_CREATE_ERROR,
                error: error instanceof Error ? error.message : Messages.BOOKING_CREATE_ERROR
            })
        }
    }
    async handleShowBookingsInClient(req: Request, res: Response): Promise<void> {
        try {
            const { clientId, pageNo } = req.params
            const page = parseInt(pageNo, 10) || 1
            const { bookings, totalPages } = await this.showBookingsInClient.findBookings(clientId, page)
            res.status(HttpStatus.OK).json({ message: Messages.BOOKING_FETCHED, Bookings:bookings, totalPages })
        } catch (error) {
            console.log('error while fetching bookings in client', error)
            res.status(HttpStatus.BAD_REQUEST).json({
                message: Messages.BOOKING_FETCH_ERROR,
                error: error instanceof Error ? error.message : Messages.BOOKING_FETCH_ERROR
            })
        }
    }
    async handleCreateBookingPayment(req: Request, res: Response): Promise<void> {
        try {
            const { bookingId } = req.body
            const { clientSecret, paymentIntentId, booking  } = await this.createBookingPaymentUseCase.inititateBookingPayment(bookingId)
            res.status(HttpStatus.OK).json({ message: Messages.PAYMENT_INITIATED, clientSecret,
      paymentIntentId,
      booking, })
        } catch (error) {
            console.log('error while initiating booking payment', error)
            res.status(HttpStatus.BAD_REQUEST).json({
                message: Messages.PAYMENT_INITIATE_ERROR,
                error: error instanceof Error ? error.message : Messages.PAYMENT_INITIATE_ERROR
            })
        }
    }
    async handleConfirmBookingPaymentUseCase(req: Request, res: Response): Promise<void> {
        try {
            const { booking, paymentIntentId } = req.body
            const ConfirmBooking = await this.confirmBookingPaymentUseCase.confirmBookingPayment(booking, paymentIntentId)
            res.status(HttpStatus.OK).json({message:Messages.PAYMENT_CONFIRMED})
        } catch (error) {
            console.log('error while confirming booking payment', error)
            res.status(HttpStatus.BAD_REQUEST).json({
                message: Messages.PAYMENT_CONFIRM_ERROR,
                error: error instanceof Error ? error.message : Messages.PAYMENT_CONFIRM_ERROR
            })
        }
    }
    async handleCancelBooking(req: Request, res: Response): Promise<void> {
        try {
            const { bookingId } = req.body
            const cancelBooking = await this.cancelBookingUseCase.cancelBooking(bookingId)
            res.status(HttpStatus.OK).json({ message: Messages.BOOKING_CANCELLED, cancelBooking })
        } catch (error) {
            console.log('error while canceling the booking', error)
            res.status(HttpStatus.BAD_REQUEST).json({
                message: Messages.BOOKING_CANCEL_ERROR,
                error: error instanceof Error ? error.message : Messages.BOOKING_CANCEL_ERROR
            })
        }
    }
}