
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '@/redux/Store';
import { toast } from 'react-toastify';
import { useFetchBookingsInVendor } from '@/hooks/vendorCustomHooks';
import BookingDetailsModal from './VendorBookingDetailModal';

// Define interfaces for type safety
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
  date: string[]; // API returns date as an array
  email: string;
  phone: number;
  service: Service;
  client?: Client; // Made optional to handle potential missing data
  vendor?: Vendor; // Made optional to handle potential missing data
  vendorApproval: string;
  paymentStatus: string;
  status: string;
  rejectionReason?: string;
}

interface FetchBookingsResponse {
  Bookings: Booking[];
  message: string;
  totalPages: number;
}

const VendorBookingsPage: React.FC = () => {
  const navigate = useNavigate();
  const vendorId = useSelector((state: RootState) => state.vendorSlice.vendor?._id);
  const [pageNo, setPageNo] = useState<number>(1);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  // Handle vendor validation in useEffect
  useEffect(() => {
    if (!vendorId) {
      toast.error('Please log in to view bookings.');
      navigate('/vendor/login');
    }
  }, [vendorId, navigate]);

  // Fetch bookings
  const { data, isLoading, error } = useFetchBookingsInVendor(vendorId || '', pageNo) as {
    data: FetchBookingsResponse | null;
    isLoading: boolean;
    error: Error | null;
  };

  // Log data for debugging
  console.log('Bookings Data:', data);

  // Handle error
  if (error) {
    toast.error(`Failed to load bookings: ${error.message || 'Unknown error'}`);
  }

  // Handle view details
  const handleViewDetails = (booking: Booking) => {
    console.log('View Details Clicked for Booking:', booking);
    setSelectedBooking(booking);
  };

  // Close modal
  const handleCloseModal = () => {
    console.log('Closing Modal');
    setSelectedBooking(null);
  };

  // If vendorId is missing, return null (handled by useEffect)
  if (!vendorId) {
    return null;
  }

  return (
    <div className="min-h-screen bg-yellow-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-yellow-600 mb-8">Vendor Bookings</h1>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-yellow-600 text-xl animate-pulse">Loading...</div>
          </div>
        ) : error || !data ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-red-600 text-xl">Error: {error?.message || 'Failed to load bookings'}</div>
          </div>
        ) : !data.Bookings.length ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-gray-600 text-xl">No bookings found.</div>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow-md p-6 border-2 border-yellow-400">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-yellow-100">
                    <th className="px-4 py-2 text-left text-yellow-600 font-semibold">Booking ID</th>
                    <th className="px-4 py-2 text-left text-yellow-600 font-semibold">Service</th>
                    <th className="px-4 py-2 text-left text-yellow-600 font-semibold">Client</th>
                    <th className="px-4 py-2 text-left text-yellow-600 font-semibold">Booking Date</th>
                    <th className="px-4 py-2 text-left text-yellow-600 font-semibold">Email</th>
                    <th className="px-4 py-2 text-left text-yellow-600 font-semibold">Phone</th>
                    <th className="px-4 py-2 text-left text-yellow-600 font-semibold">Vendor Approval</th>
                    <th className="px-4 py-2 text-left text-yellow-600 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.Bookings.map((booking: Booking) => (
                    <tr key={booking._id} className="border-b border-yellow-200">
                      <td className="px-4 py-2 text-gray-700">{booking._id}</td>
                      <td className="px-4 py-2 text-gray-700">{booking.service?.serviceTitle ?? 'N/A'}</td>
                      <td className="px-4 py-2 text-gray-700">{booking.client?.email ?? 'N/A'}</td>
                      <td className="px-4 py-2 text-gray-700">
                        {booking.date.length > 0
                          ? new Date(booking.date[0]).toLocaleDateString()
                          : 'N/A'}
                      </td>
                      <td className="px-4 py-2 text-gray-700">{booking.email ?? 'N/A'}</td>
                      <td className="px-4 py-2 text-gray-700">{booking.phone ?? 'N/A'}</td>
                      <td className="px-4 py-2 text-gray-700">
                        <span
                          className={`px-2 py-1 rounded-full text-sm ${
                            booking.vendorApproval === 'Approved'
                              ? 'bg-green-200 text-green-800'
                              : 'bg-red-200 text-red-800'
                          }`}
                        >
                          {booking.vendorApproval}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        <button
                          onClick={() => handleViewDetails(booking)}
                          className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {data.Bookings.length > 0 && (
              <div className="mt-8 flex justify-center gap-4">
                <button
                  onClick={() => setPageNo((prev) => Math.max(prev - 1, 1))}
                  disabled={pageNo === 1}
                  className="px-4 py-2 bg-yellow-400 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-yellow-500 transition-colors"
                >
                  Previous
                </button>
                <span className="text-yellow-600 font-semibold">Page {pageNo}</span>
                <button
                  onClick={() => setPageNo((prev) => prev + 1)}
                  disabled={pageNo >= data.totalPages}
                  className="px-4 py-2 bg-yellow-400 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-yellow-500 transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}

        {/* Booking Details Modal */}
        {selectedBooking && (
          <BookingDetailsModal booking={selectedBooking} onClose={handleCloseModal} />
        )}
      </div>
    </div>
  );
};

export default VendorBookingsPage;
