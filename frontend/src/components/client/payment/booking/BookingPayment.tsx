import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { toast } from 'react-toastify';
import { useCreateBookingPayment, useConfirmBookingPayment } from '@/hooks/clientCustomHooks';
import { CreditCard, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { BookingType } from '@/types/BookingType';
import { RootState } from '@/redux/Store';
import { useSelector } from 'react-redux';

interface Service {
  _id: string;
  serviceTitle: string;
  serviceDescription: string;
  serviceDuration: string;
  servicePrice: number;
}

interface Vendor {
  _id: string;
  name: string;
  email: string;
  phone: number;
}

interface Client {
  _id: string;
  email: string;
}

// Interface for the booking data coming from the previous page (with populated objects)
interface PopulatedBooking {
  _id: string;
  date: string[];
  email: string;
  phone: number;
  service: Service;
  vendor: Vendor;
  client?: Client;
  vendorApproval: string;
  paymentStatus: string;
  status: string;
  rejectionReason?: string;
}

const BookingPayment: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();
  const createBookingPayment = useCreateBookingPayment();
  const confirmBookingPayment = useConfirmBookingPayment();
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('');
  const [isElementReady, setIsElementReady] = useState(false);
  const isMountedRef = useRef(true);
  const processingRef = useRef(false);

  // Get client ID from Redux store at the component level
  const clientId = useSelector((state: RootState) => state.clientSlice.client?._id);

  // Retrieve booking from location state
  const populatedBooking = location.state?.booking as PopulatedBooking | undefined;
  console.log('Populated booking:', populatedBooking);

  // Transform populated booking to BookingType format
  const transformBookingToBookingType = useCallback((populated: PopulatedBooking): BookingType => {
    if (!clientId) {
      throw new Error('Client ID is missing. Please ensure user is logged in.');
    }

    return {
      _id: populated._id,
      serviceId: populated.service._id,
      clientId: clientId,
      vendorId: populated.vendor._id,
      date: populated.date.map(d => new Date(d)), // Convert string dates to Date objects
      email: populated.email,
      phone: populated.phone,
      vendorApproval: populated.vendorApproval as "Pending" | "Approved" | "Rejected",
      paymentStatus: populated.paymentStatus as "Pending" | "Failed" | "Successfull" | "Refunded",
      status: populated.status as "Pending" | "Rejected" | "Completed",
      rejectionReason: populated.rejectionReason,
      createdAt: new Date(), // You might want to get this from the populated booking if available
      isComplete: populated.status === 'Completed'
    };
  }, [clientId]); // Add clientId as dependency

  // Redirect if no booking data or invalid price
  useEffect(() => {
    if (!populatedBooking) {
      toast.error('No booking selected for payment');
      navigate('/bookings');
    } else if (!populatedBooking.service?.servicePrice || populatedBooking.service.servicePrice <= 0) {
      toast.error('Invalid service price');
      navigate('/bookings');
    }
    return () => {
      isMountedRef.current = false;
    };
  }, [populatedBooking, navigate]);

  // Payment handlers
  const handleCreatePaymentIntent = useCallback(
    async (paymentMethodId: string) => {
      if (!populatedBooking) {
        throw new Error('No booking selected');
      }
      try {
        const response = await createBookingPayment.mutateAsync({
          bookingId: populatedBooking._id,
          paymentIntentId: paymentMethodId,
        });
        console.log('Payment response:', response);
        const clientSecret = response.clientSecret || response.clientStripeId;

        return {
          clientSecret: clientSecret,
          payload: response.payload || { bookingId: populatedBooking._id },
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to create payment intent';
        toast.error(errorMessage);
        throw error;
      }
    },
    [populatedBooking, createBookingPayment],
  );

  const handleConfirmSuccess = useCallback(
    async (payload: any, paymentIntentId: string) => {
      if (!populatedBooking) {
        throw new Error('No booking selected');
      }
      try {
        // Transform the populated booking to BookingType format
        const bookingTypeData = transformBookingToBookingType(populatedBooking);
        
        await confirmBookingPayment.mutateAsync({
          booking: bookingTypeData, // Send the transformed booking
          paymentIntentId,
        });
        toast.success('Payment confirmed successfully');
        navigate('/serviceBookings');
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to confirm payment';
        toast.error(errorMessage);
        throw error;
      }
    },
    [populatedBooking, confirmBookingPayment, navigate, transformBookingToBookingType],
  );

  // Memoized submit handler
  const handleSubmit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();

      if (loading || processingRef.current || !isMountedRef.current || !stripe || !elements || !isElementReady) {
        if (!stripe || !elements || !isElementReady) {
          toast.error('Payment system is not ready. Please wait and try again.');
        }
        return;
      }

      processingRef.current = true;
      setLoading(true);
      setPaymentStatus('Processing...');

      try {
        const cardElement = elements.getElement(CardElement);
        if (!cardElement) {
          throw new Error('Card element not found');
        }

        if (!isMountedRef.current) {
          return;
        }

        // Create payment method
        const { error: createError, paymentMethod } = await stripe.createPaymentMethod({
          type: 'card',
          card: cardElement,
        });

        if (createError || !paymentMethod) {
          throw new Error(createError?.message || 'Failed to create payment method');
        }

        // Create payment intent
        const { clientSecret, payload } = await handleCreatePaymentIntent(paymentMethod.id);

        if (!isMountedRef.current) {
          return;
        }

        // Confirm payment
        const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
          payment_method: paymentMethod.id,
        });

        if (confirmError) {
          throw new Error(confirmError.message || 'Payment confirmation failed');
        }

        if (!isMountedRef.current) {
          return;
        }

        if (paymentIntent?.status === 'succeeded') {
          setPaymentStatus('Payment Successful');
          await handleConfirmSuccess(payload, paymentIntent.id);
        } else {
          throw new Error('Payment was not completed successfully');
        }
      } catch (error) {
        console.error('Payment error:', error);
        if (isMountedRef.current) {
          setPaymentStatus('Payment Failed');
          const errorMessage = error instanceof Error ? error.message : 'Payment failed';
          toast.error(errorMessage);
        }
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
        processingRef.current = false;
      }
    },
    [stripe, elements, isElementReady, loading, handleCreatePaymentIntent, handleConfirmSuccess],
  );

  // Card element options
  const cardElementOptions = {
    style: {
      base: {
        iconColor: '#f4d03f',
        color: '#2c2825',
        fontWeight: '400',
        fontFamily: "'Inter', 'system-ui', sans-serif",
        fontSize: '16px',
        lineHeight: '24px',
        '::placeholder': {
          color: '#a0a0a0',
        },
      },
      invalid: {
        iconColor: '#e74c3c',
        color: '#e74c3c',
      },
    },
    hidePostalCode: false,
  };

  // Handle card element ready state
  const handleElementReady = useCallback(() => {
    console.log('Card element is ready');
    setIsElementReady(true);
  }, []);

  // Handle card element changes
  const handleElementChange = useCallback(
    (event: any) => {
      console.log('Card element changed:', event);
      if (event.error) {
        console.error('Card element error:', event.error.message);
      }
      if (paymentStatus === 'Payment Failed') {
        setPaymentStatus('');
      }
    },
    [paymentStatus],
  );

  // Status icon
  const getStatusIcon = () => {
    if (paymentStatus === 'Processing...') {
      return <Loader2 className="w-5 h-5 animate-spin text-yellow-600" />;
    } else if (paymentStatus === 'Payment Successful') {
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    } else if (paymentStatus === 'Payment Failed') {
      return <XCircle className="w-5 h-5 text-red-600" />;
    }
    return null;
  };

  // Status color
  const getStatusColor = () => {
    if (paymentStatus === 'Payment Successful') return 'text-green-600';
    if (paymentStatus === 'Payment Failed') return 'text-red-600';
    return 'text-yellow-600';
  };

  if (!populatedBooking) {
    return null;
  }

  const isFormReady = stripe && elements && isElementReady && !loading;

  return (
    <div className="min-h-screen bg-yellow-50 p-6 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full border-2 border-yellow-400">
        <div className="mb-6 text-center">
          <div className="w-16 h-16 bg-yellow-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <CreditCard className="w-8 h-8 text-yellow-600" />
          </div>
          <h2 className="text-2xl font-bold text-yellow-600 mb-2">Secure Booking Payment</h2>
          <p className="text-gray-600">Complete your payment for {populatedBooking.service?.serviceTitle ?? 'N/A'}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-yellow-600">Card Details</label>
            <div
              className="border border-yellow-400 rounded-lg p-4 bg-white min-h-[50px] focus-within:ring-2 focus-within:ring-yellow-500 focus-within:border-yellow-500 transition-all"
              style={{ position: 'relative' }}
            >
              {!isElementReady && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="w-4 h-4 animate-spin text-yellow-600" />
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

          <div className="bg-yellow-100 border border-yellow-400 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-yellow-600">Total Amount</span>
              <span className="text-2xl font-bold text-yellow-600">
                ₹{populatedBooking.service?.servicePrice.toLocaleString() ?? 'N/A'}
              </span>
            </div>
          </div>

          {paymentStatus && (
            <div className={`text-center space-y-2 ${getStatusColor()}`}>
              <div className="flex items-center justify-center gap-2">
                {getStatusIcon()}
                <span className="font-semibold">
                  {paymentStatus === 'Processing...'
                    ? 'Processing payment...'
                    : paymentStatus === 'Payment Successful'
                    ? 'Payment Successful! 🎉'
                    : 'Payment Failed'}
                </span>
              </div>
              {paymentStatus === 'Processing...' && (
                <p className="text-sm text-gray-600">Please wait while we process your payment...</p>
              )}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-yellow-500 text-white px-6 py-2.5 rounded-lg hover:bg-yellow-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            disabled={!isFormReady}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : !isElementReady ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Loading payment form...
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5" />
                Pay ₹{populatedBooking.service?.servicePrice.toLocaleString() ?? 'N/A'}
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-600">🔒 Your payment information is encrypted and secure</p>
        </div>
      </div>
    </div>
  );
};

export default BookingPayment;