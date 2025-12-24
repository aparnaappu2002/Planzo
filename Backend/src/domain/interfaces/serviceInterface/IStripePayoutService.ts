import Stripe from "stripe";

export interface IStripePayoutService {
    createRefund(
        paymentIntentId: string,
        amount?: number,
        reason?: 'requested_by_customer'
    ): Promise<Stripe.Refund>;
}