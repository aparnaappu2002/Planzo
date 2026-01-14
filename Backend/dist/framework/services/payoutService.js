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
exports.StripePayoutService = void 0;
const stripe_1 = __importDefault(require("stripe"));
class StripePayoutService {
    constructor() {
        this.stripe = new stripe_1.default(process.env.STRIPE_SK, {
            apiVersion: "2025-07-30.basil"
        });
    }
    createRefund(paymentIntentId, amount, reason) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const refundParams = {
                    payment_intent: paymentIntentId,
                    reason: reason || 'requested_by_customer',
                };
                if (amount) {
                    refundParams.amount = Math.round(amount * 100);
                }
                const refund = yield this.stripe.refunds.create(refundParams);
                console.log('[StripePayoutService] Refund created:', {
                    refundId: refund.id,
                    amount: refund.amount / 100,
                    status: refund.status,
                    paymentIntent: refund.payment_intent
                });
                return refund;
            }
            catch (error) {
                console.error("[StripePayoutService] Failed to create refund:", error);
                throw new Error("Stripe refund creation failed.");
            }
        });
    }
}
exports.StripePayoutService = StripePayoutService;
