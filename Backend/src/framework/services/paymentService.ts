import Stripe from "stripe";
import { IStripeService } from "../../domain/interfaces/serviceInterface/IstripeService";


export class PaymentService implements IStripeService {
    private stripe: Stripe
    constructor() {
        this.stripe = new Stripe(process.env.STRIPE_SK!, {
            apiVersion: "2025-07-30.basil"
        })
    }
    async createPaymentIntent(
        amount: number, 
        purpose: "ticket" | "service", 
        metadata: Record<string, any>
    ): Promise<{ clientSecret: string; paymentIntentId: string }>  {

        try {
            const paymentIntent = await this.stripe.paymentIntents.create({
                amount: Math.round(amount * 100),
                currency: 'inr',
                metadata: {
                    purpose,
                    ticket: JSON.stringify(metadata)
                }
            })
            if (!paymentIntent.client_secret) {
                throw new Error("Payment intent creation failed: Missing client_secret.");
            }
            console.log("paymentIntent:",paymentIntent)
            return {
                clientSecret: paymentIntent.client_secret,
                paymentIntentId: paymentIntent.id
            };

        } catch (error) {
            console.error("[StripePaymentService] Failed to create payment intent:", error);
            throw new Error("Stripe payment intent creation failed.");
        }

    }
    async confirmPayment(paymentIntentId: string): Promise<any> {
        try {
            const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId)
            return paymentIntent;
        } catch (error) {
            console.error("[StripePaymentService] Error confirming payment:", error);
            throw new Error("Failed to confirm payment");
        }
    }
}