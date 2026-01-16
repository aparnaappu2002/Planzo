
export interface IStripeService {
    createPaymentIntent(
      amount: number,
      purpose: 'ticket' | 'service',
      metadata: Record<string, string>
    ): Promise<{clientSecret: string; paymentIntentId: string}>;
  
    confirmPayment(paymentIntentId: string): Promise<{id: string;
    status: string;
    amount: number;
    currency: string;}
>;
  }