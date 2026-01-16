
export interface IStripeService {
    createPaymentIntent(
      amount: number,
      purpose: 'ticket' | 'service',
      metadata: Record<string, any>
    ): Promise<{clientSecret: string; paymentIntentId: string}>;
  
    confirmPayment(paymentIntentId: string): Promise<{id: string;
    status: string;
    amount: number;
    currency: string;}
>;
  }