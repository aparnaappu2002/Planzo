import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useFindServiceDataWithVendor, useCreateBooking } from '@/hooks/clientCustomHooks';
import { RootState } from '@/redux/Store';
import { toast } from 'react-toastify';

// Define interfaces for type safety
interface Service {
  _id: string;
  serviceTitle: string;
  serviceDescription: string;
  price: number;
  duration: string;
  vendor: {
    _id: string;
    name: string;
    email: string;
    phone: number;
    profileImage: string;
  };
}

interface Review {
  _id: string;
  rating: number;
  comment: string;
  createdAt: string;
  userId: string;
}

interface Booking {
  serviceId: string;
  vendorId: string;
  clientId: string; // Must be a valid ObjectId
  date: string; // ISO date string
  email: string; // Added for Mongoose schema
  phone: number; // Added for Mongoose schema
}

interface ServiceDataResponse {
  message: string;
  serviceWithVendor: Service;
  reviews: Review[];
  totalPages: number;
}

const ServiceDetails: React.FC = () => {
  const { serviceId, vendorId } = useParams<{ serviceId: string; vendorId: string }>();
  const navigate = useNavigate();
  const client = useSelector((state: RootState) => state.clientSlice.client);
  console.log('Client Data:', client); // Log client to debug
  const [pageNo, setPageNo] = useState<number>(1);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [bookingDate, setBookingDate] = useState<string>('');

  // Fetch service, vendor, and reviews
  const { data, isLoading, error } = useFindServiceDataWithVendor(serviceId!, pageNo, 0);
  console.log('Service Data:', data);

  // Booking mutation
  const { mutate: createBooking, isPending: isBooking, error: bookingError } = useCreateBooking();

  // Get today's date in YYYY-MM-DD format for min attribute
  const today = new Date().toISOString().split('T')[0];

  // Handle booking with date and client validation
  const handleBookService = () => {
    if (!client || !client._id || !client.email || !client.phone) {
      console.log('Invalid Client Data:', client);
      toast.error('Please log in to book a service.');
      navigate('/login');
      return;
    }
    if (!bookingDate) {
      toast.error('Please select a booking date.');
      return;
    }
    const selectedDate = new Date(bookingDate);
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0); // Reset time to compare dates only
    if (isNaN(selectedDate.getTime())) {
      toast.error('Invalid date format. Please select a valid date.');
      return;
    }
    if (selectedDate < currentDate) {
      toast.error('Cannot select a past date. Please choose today or a future date.');
      return;
    }
    console.log('Booking Attempt:', { serviceId, vendorId, clientId: client._id, bookingDate, email: client.email, phone: client.phone });
    setIsModalOpen(true);
  };

  // Confirm booking
  const confirmBooking = () => {
    if (!client || !client._id || !client.email || !client.phone) {
      console.log('Invalid Client Data in Confirm:', client);
      toast.error('Please log in to book a service.');
      navigate('/login');
      return;
    }
    const booking: Booking = {
      serviceId: serviceId!,
      vendorId: vendorId!,
      clientId: client._id,
      date:bookingDate,
      email: client.email,
      phone: client.phone,
    };
    console.log('Sending Booking:', booking);
    createBooking(booking, {
      onSuccess: () => {
        setIsModalOpen(false);
        toast.success('Booking created successfully!');
        navigate('/serviceBookings');
      },
      onError: (err) => {
        console.error('Booking Error:', err);
        toast.error(`Failed to create booking: ${err.message || 'Unknown error'}`);
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-yellow-50">
        <div className="text-yellow-600 text-xl animate-pulse">Loading...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex justify-center items-center h-screen bg-yellow-50">
        <div className="text-red-600 text-xl">Error: {error?.message || 'Failed to load data'}</div>
      </div>
    );
  }

  const { serviceWithVendor: service, reviews, totalPages } = data as ServiceDataResponse;
  const vendor = service.vendor;

  return (
    <div className="min-h-screen bg-yellow-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Service Details Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8 border-2 border-yellow-400">
          <h1 className="text-3xl font-bold text-yellow-600 mb-4">{service.serviceTitle}</h1>
          <p className="text-gray-700 mb-4">{service.serviceDescription || 'No description available'}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600">
                <span className="font-semibold text-yellow-600">Price:</span> ₹{service.price}
              </p>
              <p className="text-gray-600">
                <span className="font-semibold text-yellow-600">Duration:</span> {service.duration}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <label className="text-gray-600 font-semibold">Select Booking Date:</label>
            <input
              type="date"
              value={bookingDate}
              onChange={(e) => setBookingDate(e.target.value)}
              min={today} // Restrict to today or future dates
              className="mt-2 p-3 w-full rounded-lg border border-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white text-yellow-800"
            />
          </div>
          <button
            onClick={handleBookService}
            disabled={isBooking || !bookingDate}
            className="mt-4 w-full bg-yellow-500 text-white py-2 rounded-lg hover:bg-yellow-600 disabled:bg-yellow-300 transition-colors"
          >
            {isBooking ? 'Booking...' : 'Book Service'}
          </button>
        </div>

        {/* Vendor Details Section */}
        <h2 className="text-2xl font-bold text-yellow-600 mb-4">Vendor Details</h2>
        <div className="bg-white rounded-lg shadow-md p-6 mb-8 border-2 border-yellow-400">
          <h3 className="text-xl font-semibold text-yellow-600 mb-2">{vendor.name}</h3>
          <p className="text-gray-600">
            <span className="font-semibold text-yellow-600">Email:</span> {vendor.email}
          </p>
          <p className="text-gray-600">
            <span className="font-semibold text-yellow-600">Phone:</span> {vendor.phone}
          </p>
          {vendor.profileImage && (
            <div className="mt-4">
              <img
                src={vendor.profileImage}
                alt={vendor.name}
                className="w-32 h-32 rounded-full object-cover border-2 border-yellow-400"
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/128?text=No+Image';
                }}
              />
            </div>
          )}
        </div>

        {/* Reviews Section */}
        <h2 className="text-2xl font-bold text-yellow-600 mb-4">Reviews</h2>
        {reviews.length === 0 ? (
          <p className="text-gray-600">No reviews available.</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div
                key={review._id}
                className="bg-white rounded-lg shadow-md p-4 border border-yellow-200"
              >
                <div className="flex items-center mb-2">
                  <span className="text-yellow-600 font-semibold">Rating: {review.rating}/5</span>
                </div>
                <p className="text-gray-600">{review.comment || 'No comment provided'}</p>
                <p className="text-gray-500 text-sm mt-2">
                  Posted on: {new Date(review.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center gap-4">
            <button
              onClick={() => setPageNo((prev) => Math.max(prev - 1, 1))}
              disabled={pageNo === 1}
              className="px-4 py-2 bg-yellow-400 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-yellow-500 transition-colors"
            >
              Previous
            </button>
            <span className="text-yellow-600 font-semibold">
              Page {pageNo} of {totalPages}
            </span>
            <button
              onClick={() => setPageNo((prev) => Math.min(prev + 1, totalPages))}
              disabled={pageNo === totalPages}
              className="px-4 py-2 bg-yellow-400 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-yellow-500 transition-colors"
            >
              Next
            </button>
          </div>
        )}

        {/* Confirmation Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full border-2 border-yellow-400">
              <h3 className="text-xl font-bold text-yellow-600 mb-4">Confirm Booking</h3>
              <p className="text-gray-700 mb-4">
                Are you sure you want to book{' '}
                <span className="font-semibold">{service.serviceTitle}</span> for{' '}
                <span>{new Date(bookingDate).toLocaleDateString()}</span>?
              </p>
              {bookingError && (
                <p className="text-red-600 mb-4">Error: {bookingError.message}</p>
              )}
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmBooking}
                  disabled={isBooking}
                  className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:bg-yellow-300 transition-colors"
                >
                  {isBooking ? 'Booking...' : 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceDetails;