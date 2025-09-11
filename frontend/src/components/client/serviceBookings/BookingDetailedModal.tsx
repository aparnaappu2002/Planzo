import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

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
  date: string[]; // API returns date as an array
  email: string;
  phone: number;
  service: Service;
  vendor: Vendor;
  client?: Client; // Optional, as it may not always be present
  vendorApproval: string;
  paymentStatus: string;
  status: string;
  rejectionReason?: string; // Optional, for rejection reason
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
  const navigate=useNavigate()

  // Placeholder handler functions (replace with actual implementations)
  const handleBookingPayment = (booking: Booking) => {
    console.log('Initiating payment for booking:', booking._id);
    navigate('/bookingPayment', { state: { booking } });
  };

  const handleChatNavigate = () => {
    console.log('Navigating to chat for booking:', booking._id);
    // Add navigation logic to chat (e.g., using react-router-dom)
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full border-2 border-yellow-400">
        <h3 className="text-xl font-bold text-yellow-600 mb-4">Booking Details</h3>
        <div className="space-y-4 text-gray-700">
          <p>
            <span className="font-semibold text-yellow-600">Booking ID:</span> {booking._id}
          </p>
          <p>
            <span className="font-semibold text-yellow-600">Service:</span>{' '}
            {booking.service.serviceTitle}
          </p>
          <p>
            <span className="font-semibold text-yellow-600">Service Description:</span>{' '}
            {booking.service.serviceDescription}
          </p>
          <p>
            <span className="font-semibold text-yellow-600">Service Duration:</span>{' '}
            {booking.service.serviceDuration}
          </p>
          <p>
            <span className="font-semibold text-yellow-600">Service Price:</span>{' '}
            ₹{booking.service.servicePrice}
          </p>
          <p>
            <span className="font-semibold text-yellow-600">Vendor:</span>{' '}
            {booking.vendor.name}
          </p>
          <p>
            <span className="font-semibold text-yellow-600">Vendor Email:</span>{' '}
            {booking.vendor.email}
          </p>
          <p>
            <span className="font-semibold text-yellow-600">Vendor Phone:</span>{' '}
            {booking.vendor.phone}
          </p>
          <p>
            <span className="font-semibold text-yellow-600">Booking Date:</span>{' '}
            {booking.date.length > 0
              ? new Date(booking.date[0]).toLocaleDateString()
              : 'N/A'}
          </p>
          <p>
            <span className="font-semibold text-yellow-600">Client Email:</span>{' '}
            {booking.email}
          </p>
          <p>
            <span className="font-semibold text-yellow-600">Client Phone:</span>{' '}
            {booking.phone}
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
                booking.status === 'Completed'
                  ? 'bg-green-200 text-green-800'
                  : 'bg-red-200 text-red-800'
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
              onClick={() => setShowReviewModal(true)}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-2.5 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
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
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-2.5 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              Chat Now
            </Button>
          )}
          {booking.paymentStatus === 'Pending' &&
            !booking?.client?.email &&
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
  );
};

export default BookingDetailsModal;