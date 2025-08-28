import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import { CreditCard, Loader2, CheckCircle, XCircle } from "lucide-react";

export interface PaymentFormProps {
  amount: number;
  metadata?: Record<string, string>;
  onCreatePaymentIntent: (paymentMethodId: string) => Promise<{
    clientSecret: string;
    payload: any;
  }>;
  onConfirmSuccess: (payload: any, paymentIntentId: string) => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  amount,
  onCreatePaymentIntent,
  onConfirmSuccess,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState("");
  const [isElementReady, setIsElementReady] = useState(false);
  
  // Use refs to track component state
  const isMountedRef = useRef(true);
  const processingRef = useRef(false);
  
  // Track component lifecycle
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Memoized submit handler to prevent recreation on re-renders
  const handleSubmit = useCallback(async (event: React.FormEvent) => {
    event.preventDefault();
    
    // Prevent multiple submissions and check if component is still mounted
    if (loading || processingRef.current || !isMountedRef.current) {
      return;
    }
    
    if (!stripe || !elements || !isElementReady) {
      toast.error("Payment system is not ready. Please wait a moment and try again.");
      return;
    }

    processingRef.current = true;
    setLoading(true);
    setPaymentStatus("Processing...");

    try {
      // Get the card element at the time of submission
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error("CARD_ELEMENT_NOT_FOUND");
      }

      // Check if component is still mounted before proceeding
      if (!isMountedRef.current) {
        throw new Error("COMPONENT_UNMOUNTED");
      }

      // Step 1: Create payment method with card element
      const { error: createError, paymentMethod } = await stripe.createPaymentMethod({
        type: "card",
        card: cardElement,
      });

      if (createError) {
        throw new Error(createError.message || "Failed to create payment method");
      }

      if (!paymentMethod) {
        throw new Error("Payment method creation failed");
      }

      // Check if component is still mounted before API call
      if (!isMountedRef.current) {
        throw new Error("COMPONENT_UNMOUNTED");
      }

      // Step 2: Create payment intent via parent component's handler
      const { clientSecret, payload } = await onCreatePaymentIntent(paymentMethod.id);

      // Final check before confirmation
      if (!isMountedRef.current) {
        throw new Error("COMPONENT_UNMOUNTED");
      }

      // Step 3: Confirm payment using the client secret and payment method ID
      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: paymentMethod.id,
        }
      );

      if (confirmError) {
        if (confirmError.type === 'integration_error') {
          throw new Error("INTEGRATION_ERROR");
        }
        throw new Error(confirmError.message || "Payment confirmation failed");
      }

      // Only update state if component is still mounted
      if (!isMountedRef.current) {
        return;
      }

      if (paymentIntent?.status === "succeeded") {
        setPaymentStatus("Payment Successful");
        onConfirmSuccess(payload, paymentIntent.id);
        toast.success("Payment successful!");
      } else {
        throw new Error("Payment was not completed successfully");
      }

    } catch (error) {
      console.error("Payment error:", error);
      
      
      // Only update state if component is still mounted
      if (!isMountedRef.current) {
        return;
      }

      setPaymentStatus("Payment Failed");
      
      let errorMessage = "Payment Failed"
      
      if (error instanceof Error) {
      errorMessage = error.message;
    }
    console.log(errorMessage)
    
    toast.error(errorMessage); 

      
      
    } finally {
      processingRef.current = false;
      // Only update loading state if component is still mounted
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [stripe, elements, isElementReady, loading, onCreatePaymentIntent, onConfirmSuccess]);

  // Card element options with comma-separated HSL values
  const cardElementOptions = {
    style: {
      base: {
        iconColor: "#f4d03f",
        color: "#2c2825",
        fontWeight: "400",
        fontFamily: "'Inter', 'system-ui', sans-serif",
        fontSize: "16px",
        lineHeight: "24px",
        "::placeholder": {
          color: "#a0a0a0",
        },
      },
      invalid: {
        iconColor: "#e74c3c",
        color: "#e74c3c",
      },
    },
    hidePostalCode: false,
  };

  // Handle card element ready state
  const handleElementReady = useCallback(() => {
    console.log("Card element is ready");
    setIsElementReady(true);
  }, []);

  const handleElementChange = useCallback((event: any) => {
    console.log("Card element changed:", event);
    if (event.error) {
      console.error("Card element error:", event.error.message);
    }
    // Clear any previous error status when user starts typing
    if (paymentStatus === "Payment Failed") {
      setPaymentStatus("");
    }
  }, [paymentStatus]);

  const getStatusIcon = () => {
    if (paymentStatus === "Processing...") {
      return <Loader2 className="w-5 h-5 animate-spin" />;
    } else if (paymentStatus === "Payment Successful") {
      return <CheckCircle className="w-5 h-5 text-payment-success" />;
    } else if (paymentStatus === "Payment Failed") {
      return <XCircle className="w-5 h-5 text-payment-error" />;
    }
    return null;
  };

  const getStatusColor = () => {
    if (paymentStatus === "Payment Successful") return "text-payment-success";
    if (paymentStatus === "Payment Failed") return "text-payment-error";
    return "text-foreground";
  };

  const isFormReady = stripe && elements && isElementReady && !loading;

  return (
    <div className="bg-payment-background border-payment-border border rounded-xl shadow-payment p-8 w-full max-w-md mx-auto">
      <div className="mb-6 text-center">
        <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
          <CreditCard className="w-8 h-8 text-primary-foreground" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Secure Payment</h2>
        <p className="text-muted-foreground">Complete your ticket purchase securely</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Card Details</label>
          <div 
            className="border border-payment-border rounded-lg p-4 bg-white min-h-[50px] focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all"
            style={{ position: 'relative' }}
          >
            {!isElementReady && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
              </div>
            )}
            <CardElement 
              options={cardElementOptions} 
              onReady={handleElementReady}
              onChange={handleElementChange}
            />
          </div>
          {!isElementReady && (
            <p className="text-sm text-gray-500">Loading payment form...</p>
          )}
        </div>

        <div className="bg-gradient-subtle border border-payment-border rounded-lg p-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-foreground">Total Amount</span>
            <span className="text-2xl font-bold text-foreground">₹{amount.toLocaleString()}</span>
          </div>
        </div>

        {paymentStatus && (
          <div className={`text-center space-y-2 ${getStatusColor()}`}>
            <div className="flex items-center justify-center gap-2">
              {getStatusIcon()}
              <span className="font-semibold">
                {paymentStatus === "Processing..."
                  ? "Processing payment..."
                  : paymentStatus === "Payment Successful"
                    ? "Payment Successful! 🎉"
                    : "Payment Failed"}
              </span>
            </div>
            {paymentStatus === "Processing..." && (
              <p className="text-sm text-muted-foreground">Please wait while we process your payment and confirm your tickets</p>
            )}
          </div>
        )}

        <Button 
          type="submit" 
          variant="payment"
          size="lg"
          className="w-full" 
          disabled={!isFormReady}
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              Processing...
            </div>
          ) : !isElementReady ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              Loading payment form...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Pay ₹{amount.toLocaleString()}
            </div>
          )}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-xs text-muted-foreground">
          🔒 Your payment information is encrypted and secure
        </p>
      </div>
    </div>
  );
};

export default PaymentForm;