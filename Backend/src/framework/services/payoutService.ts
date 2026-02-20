import Stripe from "stripe";
import { IStripePayoutService } from "../../domain/interfaces/serviceInterface/IStripePayoutService";

export class StripePayoutService implements IStripePayoutService {
    private stripe: Stripe;

    constructor() {
        this.stripe = new Stripe(process.env.STRIPE_SK!, {
            apiVersion: "2025-08-27.basil"
        });
    }

    
    async createRefund(
        paymentIntentId: string,
        amount?: number,
        reason?:  'requested_by_customer'
    ): Promise<Stripe.Refund> {
        try {
            const refundParams: Stripe.RefundCreateParams = {
                payment_intent: paymentIntentId,
                reason: reason || 'requested_by_customer',
            };

            if (amount) {
                refundParams.amount = Math.round(amount * 100);
            }

            const refund = await this.stripe.refunds.create(refundParams);

            console.log('[StripePayoutService] Refund created:', {
                refundId: refund.id,
                amount: refund.amount / 100,
                status: refund.status,
                paymentIntent: refund.payment_intent
            });

            return refund;
        } catch (error) {
            console.error("[StripePayoutService] Failed to create refund:", error);
            throw new Error("Stripe refund creation failed.");
        }
    }
}