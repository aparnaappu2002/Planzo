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

  // Handle error
  if (error) {
    toast.error(`Failed to load bookings: ${error.message || 'Unknown error'}`);
  }

  // Handle view details
  const handleViewDetails = (booking: Booking) => {
    setSelectedBooking(booking);
  };

  // Close modal
  const handleCloseModal = () => {
    setSelectedBooking(null);
  };

  // If vendorId is missing, return null (handled by useEffect)
  if (!vendorId) {
    return null;
  }

  return (
    <div className="min-h-screen bg-yellow-50 p-3 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-yellow-600 mb-4 sm:mb-6 md:mb-8">
          Vendor Bookings
        </h1>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-yellow-600 text-lg sm:text-xl animate-pulse">Loading...</div>
          </div>
        ) : error || !data ? (
          <div className="flex justify-center items-center h-64 px-4">
            <div className="text-red-600 text-base sm:text-xl text-center">
              Error: {error?.message || 'Failed to load bookings'}
            </div>
          </div>
        ) : !data.Bookings.length ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-gray-600 text-lg sm:text-xl">No bookings found.</div>
          </div>
        ) : (
          <>
            {/* Desktop Table View - Hidden on mobile */}
            <div className="hidden lg:block bg-white rounded-lg shadow-md p-6 border-2 border-yellow-400 overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-yellow-100">
                    <th className="px-4 py-2 text-left text-yellow-600 font-semibold">Booking ID</th>
                    <th className="px-4 py-2 text-left text-yellow-600 font-semibold">Service</th>
                    <th className="px-4 py-2 text-left text-yellow-600 font-semibold">Client</th>
                    <th className="px-4 py-2 text-left text-yellow-600 font-semibold">Booking Date</th>
                    <th className="px-4 py-2 text-left text-yellow-600 font-semibold">Email</th>
                    <th className="px-4 py-2 text-left text-yellow-600 font-semibold">Phone</th>
                    <th className="px-4 py-2 text-left text-yellow-600 font-semibold">Status</th>
                    <th className="px-4 py-2 text-left text-yellow-600 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.Bookings.map((booking: Booking) => (
                    <tr key={booking._id} className="border-b border-yellow-200">
                      <td className="px-4 py-2 text-gray-700 text-sm">{booking._id.slice(0, 8)}...</td>
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
                          className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors text-sm"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile/Tablet Card View */}
            <div className="lg:hidden space-y-4">
              {data.Bookings.map((booking: Booking) => (
                <div
                  key={booking._id}
                  className="bg-white rounded-lg shadow-md p-4 sm:p-5 border-2 border-yellow-400"
                >
                  <div className="space-y-3">
                    {/* Service Title */}
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg sm:text-xl font-bold text-yellow-600 flex-1">
                        {booking.service?.serviceTitle ?? 'N/A'}
                      </h3>
                      <span
                        className={`px-2 py-1 rounded-full text-xs sm:text-sm ml-2 ${
                          booking.vendorApproval === 'Approved'
                            ? 'bg-green-200 text-green-800'
                            : 'bg-red-200 text-red-800'
                        }`}
                      >
                        {booking.vendorApproval}
                      </span>
                    </div>

                    {/* Booking Details Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-sm">
                      <div>
                        <span className="font-semibold text-gray-600">Booking ID:</span>
                        <p className="text-gray-700 break-all">{booking._id.slice(0, 12)}...</p>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-600">Date:</span>
                        <p className="text-gray-700">
                          {booking.date.length > 0
                            ? new Date(booking.date[0]).toLocaleDateString()
                            : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-600">Client:</span>
                        <p className="text-gray-700 break-all">{booking.client?.email ?? 'N/A'}</p>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-600">Email:</span>
                        <p className="text-gray-700 break-all">{booking.email ?? 'N/A'}</p>
                      </div>
                      <div className="sm:col-span-2">
                        <span className="font-semibold text-gray-600">Phone:</span>
                        <p className="text-gray-700">{booking.phone ?? 'N/A'}</p>
                      </div>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() => handleViewDetails(booking)}
                      className="w-full mt-2 px-4 py-2.5 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-medium"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {data.Bookings.length > 0 && (
              <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4">
                <button
                  onClick={() => setPageNo((prev) => Math.max(prev - 1, 1))}
                  disabled={pageNo === 1}
                  className="w-full sm:w-auto px-6 py-2.5 bg-yellow-400 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-yellow-500 transition-colors font-medium"
                >
                  Previous
                </button>
                <span className="text-yellow-600 font-semibold text-base sm:text-lg">
                  Page {pageNo} of {data.totalPages}
                </span>
                <button
                  onClick={() => setPageNo((prev) => prev + 1)}
                  disabled={pageNo >= data.totalPages}
                  className="w-full sm:w-auto px-6 py-2.5 bg-yellow-400 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-yellow-500 transition-colors font-medium"
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