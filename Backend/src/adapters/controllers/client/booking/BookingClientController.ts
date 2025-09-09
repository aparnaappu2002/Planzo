import { Request, Response } from "express";
import { IcreateBookingUseCase } from "../../../../domain/interfaces/useCaseInterfaces/client/booking/IcreateBookingUseCase";
import { HttpStatus } from "../../../../domain/entities/httpStatus";
import { BookingEntity } from "../../../../domain/entities/bookingEntity";
import { IshowServiceWithVendorUseCase } from "../../../../domain/interfaces/useCaseInterfaces/client/booking/IshowServiceWithVendorUseCase";
import { IshowBookingsInClientUseCase } from "../../../../domain/interfaces/useCaseInterfaces/client/booking/IshowBookingInClientUseCase";

export class BookingClientController {
    private showServiceWithVendorUseCase:IshowServiceWithVendorUseCase
    private createBookingUseCase: IcreateBookingUseCase
    private showBookingsInClient:IshowBookingsInClientUseCase
    
    constructor(showServiceWithVendorUseCase:IshowServiceWithVendorUseCase,createBookingUseCase: IcreateBookingUseCase,showBookingsInClient:IshowBookingsInClientUseCase) {
        this.createBookingUseCase = createBookingUseCase
        this.showServiceWithVendorUseCase=showServiceWithVendorUseCase
        this.showBookingsInClient=showBookingsInClient
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
            const page = parseInt(pageNo, 10) || 1
            const { Bookings, totalPages } = await this.showBookingsInClient.findBookings(clientId, page)
            res.status(HttpStatus.OK).json({ message: 'Bookings fetched', Bookings, totalPages })
        } catch (error) {
            console.log('error while fetching bookings in client', error)
            res.status(HttpStatus.BAD_REQUEST).json({
                message: 'error while fetching bookings in client',
                error: error instanceof Error ? error.message : 'error while fetching bookings in client'
            })
        }
    }
}