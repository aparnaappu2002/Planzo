import { BookingPaymentEntity } from "../../../../entities/bookingPayment/bookingPaymentEntity";

export interface IcreateBookingPaymentUseCase {
    inititateBookingPayment(bookingId: string, paymentIntentId: string): Promise<{booking:BookingPaymentEntity , clientStripeId:string}>
}