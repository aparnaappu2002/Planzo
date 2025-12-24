import { BookingPaymentEntity } from "../../../domain/entities/bookingPayment/bookingPaymentEntity";
import { PaymentEntity } from "../../../domain/entities/payment/paymentEntity";
import { IbookingRepository } from "../../../domain/interfaces/repositoryInterfaces/booking/IbookingRepository";
import { IpaymentRepository } from "../../../domain/interfaces/repositoryInterfaces/payment/IpaymentRepository";
import { IStripeService } from "../../../domain/interfaces/serviceInterface/IstripeService";
import { IcreateBookingPaymentUseCase } from "../../../domain/interfaces/useCaseInterfaces/client/booking/IcreateBookingPaymentUseCase";

export class CreateBookingPaymentUseCase implements IcreateBookingPaymentUseCase {
    private bookingDatabase: IbookingRepository
    private paymentService: IStripeService
    private paymentDatabase: IpaymentRepository
    constructor(bookingDatabase: IbookingRepository, paymentService: IStripeService, paymentDatabase: IpaymentRepository) {
        this.bookingDatabase = bookingDatabase
        this.paymentService = paymentService
        this.paymentDatabase = paymentDatabase
    }
    async inititateBookingPayment(bookingId: string): Promise<{ booking: BookingPaymentEntity;
  clientSecret: string;
  paymentIntentId: string;
 }> {
        const booking = await this.bookingDatabase.findBookingByIdForPayment(bookingId)
        console.log(booking)
        if (!booking) throw new Error('No booking found in this ID')
        if (booking.status != 'Completed') throw new Error('This Booking is not completed')
        if (booking.paymentStatus == "Successfull") throw new Error('This booking is Already paid')
        const totalAmount = booking.date.length * booking.service.servicePrice
        const { clientSecret, paymentIntentId }  = await this.paymentService.createPaymentIntent(totalAmount, 'service', { booking: booking })
if (!clientSecret || !paymentIntentId) {
            throw new Error("Error while creating stripe payment intent");
        }
        const paymentDetails: PaymentEntity = {
            amount: totalAmount,
            currency: 'inr',
            paymentId: paymentIntentId,
            receiverId: booking.vendorId,
            purpose: 'serviceBooking',
            status: "pending",
            userId: booking.clientId,
            bookingId: booking._id
        }
        const createPayment = await this.paymentDatabase.createPayment(paymentDetails)
        if (!createPayment) throw new Error('Error while creating payment document')
return { 
            booking, 
            clientSecret,
            paymentIntentId 
        };
    }
}