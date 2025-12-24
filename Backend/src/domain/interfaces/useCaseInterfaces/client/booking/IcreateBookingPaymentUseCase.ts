import { BookingPaymentEntity } from "../../../../entities/bookingPayment/bookingPaymentEntity";

export interface IcreateBookingPaymentUseCase {
    inititateBookingPayment(bookingId: string): Promise<{
        booking: BookingPaymentEntity;
        clientSecret: string;
        paymentIntentId: string;
    }>;
}
