"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
const stripe_1 = __importDefault(require("stripe"));
class PaymentService {
    constructor() {
        this.stripe = new stripe_1.default(process.env.STRIPE_SK, {
            apiVersion: "2025-07-30.basil"
        });
    }
    createPaymentIntent(amount, purpose, metadata) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const paymentIntent = yield this.stripe.paymentIntents.create({
                    amount: Math.round(amount * 100),
                    currency: 'inr',
                    metadata: {
                        purpose,
                        ticket: JSON.stringify(metadata)
                    }
                });
                if (!paymentIntent.client_secret) {
                    throw new Error("Payment intent creation failed: Missing client_secret.");
                }
                console.log("paymentIntent:", paymentIntent);
                return {
                    clientSecret: paymentIntent.client_secret,
                    paymentIntentId: paymentIntent.id
                };
            }
            catch (error) {
                console.error("[StripePaymentService] Failed to create payment intent:", error);
                throw new Error("Stripe payment intent creation failed.");
            }
        });
    }
    confirmPayment(paymentIntentId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const paymentIntent = yield this.stripe.paymentIntents.retrieve(paymentIntentId);
                return paymentIntent;
            }
            catch (error) {
                console.error("[StripePaymentService] Error confirming payment:", error);
                throw new Error("Failed to confirm payment");
            }
        });
    }
}
exports.PaymentService = PaymentService;
