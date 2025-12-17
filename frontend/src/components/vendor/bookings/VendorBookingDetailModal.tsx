
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useApproveBooking,useRejectBooking,useUpdateBookingAsComplete } from '@/hooks/vendorCustomHooks';
import { RootState } from '@/redux/Store';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

interface Service {
  _id: string;
  serviceTitle: string;
  serviceDescription: string;
  serviceDuration: string;
  servicePrice: number;
}

interface Client {
  _id: string;
  email: string;
  phone: number;
}

interface Vendor {
  _id: string;
  name: string;
  email: string;
  phone: number;
}

interface Booking {
  _id: string;
  date: string[];
  email: string;
  phone: number;
  service: Service;
  client?: Client;
  vendor?: Vendor;
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
  const queryClient = useQueryClient();
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [cancelBookingId, setCancelBookingId] = useState<string | null>(null);
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showApproveConfirmModal, setShowApproveConfirmModal] = useState(false);
  const [showStatusConfirmModal, setShowStatusConfirmModal] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<string>('');
  const vendorId = useSelector((state: RootState) => state.vendorSlice.vendor?._id)
  const navigate=useNavigate()

  // Log booking for debugging

  // Mutation hooks
  const approveBooking = useApproveBooking();
  const rejectBooking = useRejectBooking();
  const updateBookingStatus = useUpdateBookingAsComplete();

  // Handlers
  const handleApprove = (bookingId: string) => {
    setCancelBookingId(bookingId);
    setShowApproveConfirmModal(true);
  };

  const handleConfirmApprove = async () => {
    if (!cancelBookingId) return;
    try {
      await approveBooking.mutateAsync(cancelBookingId);
      toast.success('Booking approved successfully');
      queryClient.invalidateQueries({ queryKey: ['Bookings-in-vendor'] });
      setShowApproveConfirmModal(false);
      setCancelBookingId(null);
      onClose();
    } catch (error) {
      toast.error(`Failed to approve booking: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleDecline = (bookingId: string) => {
    setCancelBookingId(bookingId);
    setShowDeclineModal(true);
  };

  const handleConfirmDecline = async () => {
    if (!cancelBookingId || !rejectionReason) {
      toast.error('Please provide a rejection reason');
      return;
    }
    try {
      await rejectBooking.mutateAsync({ bookingId: cancelBookingId, rejectionReason });
      toast.success('Booking rejected successfully');
      queryClient.invalidateQueries({ queryKey: ['Bookings-in-vendor'] });
      setShowDeclineModal(false);
      setRejectionReason('');
      setCancelBookingId(null);
      onClose();
    } catch (error) {
      toast.error(`Failed to reject booking: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleChangeStatus = (booking: Booking) => {
    const newStatus = booking.status === 'Pending' ? 'Completed' : 'Pending';
    setPendingStatus(newStatus);
    setCancelBookingId(booking._id);
    setShowStatusConfirmModal(true);
  };

  const handleConfirmChangeStatus = async () => {
    if (!cancelBookingId || !pendingStatus) return;
    try {
      await updateBookingStatus.mutateAsync({ bookingId: cancelBookingId, status: pendingStatus });
      toast.success(`Booking marked as ${pendingStatus}`);
      queryClient.invalidateQueries({ queryKey: ['Bookings-in-vendor'] });
      setShowStatusConfirmModal(false);
      setPendingStatus('');
      setCancelBookingId(null);
      onClose();
    } catch (error) {
      toast.error(`Failed to update booking status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleBookingPayment = (booking: Booking) => {
    // Add payment logic here (e.g., redirect to payment gateway)
  };

  const handleChatNavigate = () => {
        if (booking.client?.email) {

            navigate('/vendor/chats', {
                state: {
                    clientId: booking.client._id,
                    vendorId: vendorId,
                    selectedChat: true
                }
            })
        }}

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000]">
        <div className="bg-white rounded-lg p-6 max-w-md w-full border-2 border-yellow-400">
          <h3 className="text-xl font-bold text-yellow-600 mb-4">Booking Details</h3>
          <div className="space-y-4 text-gray-700">
            <p>
              <span className="font-semibold text-yellow-600">Booking ID:</span> {booking._id}
            </p>
            <p>
              <span className="font-semibold text-yellow-600">Service:</span>{' '}
              {booking.service?.serviceTitle ?? 'N/A'}
            </p>
            <p>
              <span className="font-semibold text-yellow-600">Service Description:</span>{' '}
              {booking.service?.serviceDescription ?? 'N/A'}
            </p>
            <p>
              <span className="font-semibold text-yellow-600">Service Duration:</span>{' '}
              {booking.service?.serviceDuration ?? 'N/A'}
            </p>
            <p>
              <span className="font-semibold text-yellow-600">Service Price:</span>{' '}
              {booking.service?.servicePrice != null ? `$${booking.service.servicePrice}` : 'N/A'}
            </p>
            <p>
              <span className="font-semibold text-yellow-600">Client:</span>{' '}
              {booking.client?.email ?? 'N/A'}
            </p>
            <p>
              <span className="font-semibold text-yellow-600">Client Phone:</span>{' '}
              {booking.client?.phone ?? 'N/A'}
            </p>
           
            <p>
              <span className="font-semibold text-yellow-600">Booking Date:</span>{' '}
              {booking.date.length > 0
                ? new Date(booking.date[0]).toLocaleDateString()
                : 'N/A'}
            </p>
            <p>
              <span className="font-semibold text-yellow-600">Email:</span>{' '}
              {booking.email ?? 'N/A'}
            </p>
            <p>
              <span className="font-semibold text-yellow-600">Phone:</span>{' '}
              {booking.phone ?? 'N/A'}
            </p>
            <p>
              <span className="font-semibold text-yellow-600">Vendor Approval:</span>{' '}
              <span
                className={`px-2 py-1 rounded-full text-sm ${
                  booking.vendorApproval === 'Approved'
                    ? 'bg-green-200 text-green-800'
                    : 'bg-red-200 text-red-800'
                }`}
              >
                {booking.vendorApproval ?? 'N/A'}
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
                {booking.paymentStatus ?? 'N/A'}
              </span>
            </p>
            <p>
              <span className="font-semibold text-yellow-600">Status:</span>{' '}
              <span
                className={`px-2 py-1 rounded-full text-sm ${
                  booking.status === 'Completed'
                    ? 'bg-green-200 text-green-800'
                    : 'bg-red-200 text-red-800'
                }`}
              >
                {booking.status ?? 'N/A'}
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
            {booking?.client?.email && booking?.vendorApproval === 'Pending' && (
              <>
                <Button
                  onClick={() => handleApprove(booking._id)}
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-2.5 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
                  disabled={approveBooking.isPending}
                >
                  {approveBooking.isPending ? 'Approving...' : 'Approve'}
                </Button>
                <Button
                  onClick={() => handleDecline(booking._id)}
                  className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-2.5 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
                  disabled={rejectBooking.isPending}
                >
                  {rejectBooking.isPending ? 'Declining...' : 'Decline'}
                </Button>
              </>
            )}
            {booking?.client?.email && booking.vendorApproval === 'Approved' && booking.paymentStatus !== 'Successfull' && (
              <Button
                onClick={() => handleChangeStatus(booking)}
                className={`${
                  booking.status === 'Pending'
                    ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
                    : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
                } text-white px-6 py-2.5 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg`}
                disabled={updateBookingStatus.isPending}
              >
                {updateBookingStatus.isPending
                  ? 'Updating...'
                  : booking.status === 'Pending'
                  ? 'Mark as Complete'
                  : 'Mark as not Complete'}
              </Button>
            )}
            {booking.status === 'Completed' && booking.paymentStatus === 'Successfull' && (
              <Button
                onClick={() => setShowReviewModal(true)}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-2.5 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                Add Review
              </Button>
            )}
            {booking.status === 'Completed' &&
              booking.paymentStatus !== 'Successfull' &&
              booking.paymentStatus !== 'Refunded' &&
              !booking.client?.email && (
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
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-2.5 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                Chat Now
              </Button>
            )}
            {booking.paymentStatus === 'Pending' &&
              !booking.client?.email &&
              booking.status === 'Pending' && (
                <Button
                  onClick={() => {
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

      {/* Approve Confirmation Modal */}
      {showApproveConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1001]">
          <div className="bg-white rounded-lg p-6 max-w-md w-full border-2 border-yellow-400">
            <h3 className="text-xl font-bold text-yellow-600 mb-4">Confirm Approval</h3>
            <p className="text-gray-700 mb-4">Are you sure you want to approve this booking?</p>
            <div className="flex justify-end mt-4 space-x-3">
              <Button
                onClick={() => {
                  setShowApproveConfirmModal(false);
                  setCancelBookingId(null);
                }}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmApprove}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-2.5 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
                disabled={approveBooking.isPending}
              >
                {approveBooking.isPending ? 'Approving...' : 'Confirm Approve'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Decline Confirmation Modal */}
      {showDeclineModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1001]">
          <div className="bg-white rounded-lg p-6 max-w-md w-full border-2 border-yellow-400">
            <h3 className="text-xl font-bold text-yellow-600 mb-4">Decline Booking</h3>
            <p className="text-gray-700 mb-4">Please provide a reason for declining the booking:</p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg"
              placeholder="Enter rejection reason"
              rows={4}
            />
            <div className="flex justify-end mt-4 space-x-3">
              <Button
                onClick={() => {
                  setShowDeclineModal(false);
                  setRejectionReason('');
                  setCancelBookingId(null);
                }}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmDecline}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-2.5 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
                disabled={rejectBooking.isPending || !rejectionReason}
              >
                {rejectBooking.isPending ? 'Declining...' : 'Confirm Decline'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Status Update Confirmation Modal */}
      {showStatusConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1001]">
          <div className="bg-white rounded-lg p-6 max-w-md w-full border-2 border-yellow-400">
            <h3 className="text-xl font-bold text-yellow-600 mb-4">Confirm Status Update</h3>
            <p className="text-gray-700 mb-4">Are you sure you want to mark this booking as {pendingStatus}?</p>
            <div className="flex justify-end mt-4 space-x-3">
              <Button
                onClick={() => {
                  setShowStatusConfirmModal(false);
                  setPendingStatus('');
                  setCancelBookingId(null);
                }}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmChangeStatus}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-2.5 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
                disabled={updateBookingStatus.isPending}
              >
                {updateBookingStatus.isPending ? 'Updating...' : 'Confirm'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BookingDetailsModal;
