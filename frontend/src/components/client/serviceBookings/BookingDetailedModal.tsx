import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { RootState } from '@/redux/Store';
import { useSelector } from 'react-redux';
import { useCancelBooking } from '@/hooks/clientCustomHooks';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import ReviewModal from '@/components/other components/review/ReviewModal';

// Interfaces remain unchanged
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
  email: string;
}

interface Booking {
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

interface BookingDetailsModalProps {
  booking: Booking;
  onClose: () => void;
}

const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, className, ...props }) => (
  <button className={className} {...props}>
    {children}
  </button>
);

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const BookingDetailsModal: React.FC<BookingDetailsModalProps> = ({ booking, onClose }) => {
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [cancelBookingId, setCancelBookingId] = useState<string | null>(null);
  const clientId = useSelector((state: RootState) => state.clientSlice.client?._id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const cancelBooking = useCancelBooking();

  // Debug: Log booking data to verify structure
  console.log('Booking Data:', {
    id: booking._id,
    paymentStatus: booking.paymentStatus,
    status: booking.status,
    clientEmail: booking.client?.email,
    fullBooking: JSON.stringify(booking, null, 2), // Detailed log for inspection
  });

  const handleCancelBooking = () => {
    console.log('handleCancelBooking called with ID:', cancelBookingId);
    if (!cancelBookingId) {
      toast.error('No booking ID provided for cancellation');
      return;
    }

    cancelBooking.mutate(cancelBookingId, {
      onSuccess: () => {
        console.log('Booking cancellation successful');
        queryClient.invalidateQueries({ queryKey: ['Bookings in client'] });
        toast.success('Booking cancelled successfully');
        setShowConfirmModal(false);
        setCancelBookingId(null);
        onClose();
      },
      onError: (err: any) => {
        console.error('Cancellation error:', err);
        toast.error(err.message || 'Failed to cancel booking');
      },
    });
  };

  const handleBookingPayment = (booking: Booking) => {
    console.log('Initiating payment for booking:', booking._id);
    navigate('/bookingPayment', { state: { booking } });
  };

  const handleChatNavigate = () => {
    console.log('Navigating to chat for booking:', booking._id);
    navigate('/chat', {
      state: {
        clientId: clientId,
        vendorId: booking.vendor._id,
        selectedChat: true,
      },
    });
  };

  // Debug: Log when attempting to render the Cancel Booking button
  const canShowCancelButton =
    booking.paymentStatus === 'Pending' &&
    !booking?.client?.email &&
    booking.status === 'Pending';
  console.log('Can show Cancel Booking button:', canShowCancelButton);
  console.log('showConfirmModal state:', showConfirmModal); // Debug modal state

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full border-2 border-yellow-400">
          <h3 className="text-xl font-bold text-yellow-600 mb-4">Booking Details</h3>
          <div className="space-y-4 text-gray-700">
            <p><span className="font-semibold text-yellow-600">Booking ID:</span> {booking._id}</p>
            <p><span className="font-semibold text-yellow-600">Service:</span> {booking.service.serviceTitle}</p>
            <p><span className="font-semibold text-yellow-600">Service Description:</span> {booking.service.serviceDescription}</p>
            <p><span className="font-semibold text-yellow-600">Service Duration:</span> {booking.service.serviceDuration}</p>
            <p><span className="font-semibold text-yellow-600">Service Price:</span> ₹{booking.service.servicePrice}</p>
            <p><span className="font-semibold text-yellow-600">Vendor:</span> {booking.vendor.name}</p>
            <p><span className="font-semibold text-yellow-600">Vendor Email:</span> {booking.vendor.email}</p>
            <p><span className="font-semibold text-yellow-600">Vendor Phone:</span> {booking.vendor.phone}</p>
            <p>
              <span className="font-semibold text-yellow-600">Booking Date:</span>{' '}
              {booking.date.length > 0 ? new Date(booking.date[0]).toLocaleDateString() : 'N/A'}
            </p>
            <p><span className="font-semibold text-yellow-600">Client Email:</span> {booking.email}</p>
            <p><span className="font-semibold text-yellow-600">Client Phone:</span> {booking.phone}</p>
            <p>
              <span className="font-semibold text-yellow-600">Vendor Approval:</span>{' '}
              <span
                className={`px-2 py-1 rounded-full text-sm ${
                  booking.vendorApproval === 'Approved' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                }`}
              >
                {booking.vendorApproval}
              </span>
            </p>
            <p>
              <span className="font-semibold text-yellow-600">Payment Status:</span>{' '}
              <span
                className={`px-2 py-1 rounded-full text-sm ${
                  booking.paymentStatus === 'Successfull' || booking.paymentStatus === 'Paid'
                    ? 'bg-green-200 text-green-800'
                    : 'bg-red-200 text-red-800'
                }`}
              >
                {booking.paymentStatus}
              </span>
            </p>
            <p>
              <span className="font-semibold text-yellow-600">Status:</span>{' '}
              <span
                className={`px-2 py-1 rounded-full text-sm ${
                  booking.status === 'Completed' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                }`}
              >
                {booking.status}
              </span>
            </p>
            {booking.rejectionReason && (
              <motion.div
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                className="bg-red-900/20 p-5 rounded-xl border border-red-800"
              >
                <h3 className="text-sm font-medium text-red-400 mb-3">Rejection Reason</h3>
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center gap-3">
                    <p className="text-white">{booking.rejectionReason}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
          <div className="flex justify-end mt-6 space-x-3">
            {booking.status === 'Completed' && booking.paymentStatus === 'Successfull' && (
              <Button
                onClick={() => {
                  console.log('Add Review clicked, opening ReviewModal'); // Debug
                  setShowReviewModal(true);
                }}
                className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white px-6 py-2.5 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                Add Review
              </Button>
            )}
            {booking.status === 'Completed' &&
              booking.paymentStatus !== 'Successfull' &&
              booking.paymentStatus !== 'Refunded' &&
              !booking?.client?.email && (
                <Button
                  onClick={() => handleBookingPayment(booking)}
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-2.5 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  Pay Now
                </Button>
              )}
            {booking.vendorApproval === 'Approved' && (
              <Button
                onClick={handleChatNavigate}
                className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white px-6 py-2.5 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                Chat Now
              </Button>
            )}
            {canShowCancelButton && (
              <Button
                onClick={() => {
                  console.log('Cancel Booking clicked, setting ID:', booking._id);
                  setCancelBookingId(booking._id);
                  setShowConfirmModal(true);
                }}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-2.5 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                Cancel Booking
              </Button>
            )}
            <Button
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Close
            </Button>
          </div>
        </div>
      </div>

      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-lg p-6 max-w-md w-full border-2 border-red-400">
            <h3 className="text-xl font-bold text-red-600 mb-4">Confirm Cancellation</h3>
            <p className="text-gray-700 mb-6">Are you sure you want to cancel this booking? This action cannot be undone.</p>
            <div className="flex justify-end space-x-3">
              <Button
                onClick={() => {
                  console.log('No button clicked, closing confirm modal');
                  setShowConfirmModal(false);
                  setCancelBookingId(null);
                }}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors"
              >
                No
              </Button>
              <Button
                onClick={handleCancelBooking}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-2.5 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                Yes, Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      <ReviewModal
        booking={booking}
        showReviewModal={showReviewModal}
        setShowReviewModal={setShowReviewModal}
      />
    </>
  );
};

export default BookingDetailsModal;