import React from 'react';
import { useVendorDashboardDetails, usePdfDownloadVendor } from '@/hooks/vendorCustomHooks';
import { Period } from '@/types/DatePeriodType';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/Store';

// Define interfaces based on actual data structure
interface Booking {
  _id: string;
  clientId: string;
  createdAt: string;
  date: string[];
  email: string;
  isComplete: boolean;
  paymentStatus: string;
  phone: number;
  serviceId: string;
  status: string;
  vendorApproval: string;
  vendorId: string;
}

interface Event {
  _id: string;
  address: string;
  attendees: any[];
  attendeesCount: number;
  category: string;
  createdAt: string;
  date: string[];
  description: string;
  endTime: string;
  hostedBy: string;
  isActive: boolean;
  location: { type: string; coordinates: number[] };
  posterImage: string[];
  startTime: string;
  status: string;
  ticketVariants: any[];
  title: string;
  venueName: string;
  __v: number;
}

interface RevenueData {
  month: string;
  revenue: number;
}

interface VendorDashboardData {
  message: string;
  recentBookings: Booking[];
  recentEvents: Event[];
  revenueChart: RevenueData[];
  totalBookings: number;
  totalEvents: number;
  totalRevenue: number;
  totalTickets: number;
}

const VendorDashboardPage: React.FC = () => {
  const vendorId = useSelector((state: RootState) => state.vendorSlice.vendor?._id);

  const [datePeriod, setDatePeriod] = React.useState<Period>('allTime');

  const {
    data: dashboardData,
    isLoading,
    error,
  } = useVendorDashboardDetails(vendorId || '', datePeriod);
  console.log("Dashboard:", dashboardData);

  const { mutate: downloadPdf, isPending: isDownloading } = usePdfDownloadVendor();
  console.log("Download:", downloadPdf);

  const handleDownloadPdf = () => {
    if (vendorId) {
      downloadPdf( vendorId ); // Only pass vendorId, not datePeriod
    }
  };

  // Format date helper
  const formatDate = (isoString: string) => new Date(isoString).toLocaleDateString();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-yellow-50 flex items-center justify-center">
        <div className="text-yellow-800 text-lg">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-yellow-50 flex items-center justify-center">
        <div className="text-red-600 text-lg">
          Error loading dashboard: {(error as Error)?.message || String(error)}
        </div>
      </div>
    );
  }

  const data = dashboardData as VendorDashboardData;

  // Format revenue for display
  const formattedRevenue = data?.totalRevenue?.toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
  }) || '₹0.00';

  return (
    <div className="min-h-screen bg-yellow-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-yellow-800">Vendor Dashboard</h1>
            <p className="text-yellow-600 mt-1">Overview for the selected period</p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={datePeriod}
              onChange={(e) => setDatePeriod(e.target.value as Period)}
              className="bg-white border border-yellow-300 rounded-md px-3 py-2 text-yellow-800 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              <option value="today">Today</option>
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="year">Last Year</option>
              <option value="allTime">All Time</option>
            </select>
            <button
              onClick={handleDownloadPdf}
              disabled={isDownloading || !vendorId}
              className="bg-yellow-500 hover:bg-yellow-600 disabled:bg-yellow-300 text-white font-medium py-2 px-6 rounded-md transition-colors flex items-center space-x-2"
            >
              {isDownloading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Downloading...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Download PDF</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">Total Revenue</p>
                <p className="text-2xl font-bold text-yellow-800">{formattedRevenue}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">Total Bookings</p>
                <p className="text-2xl font-bold text-yellow-800">{data?.totalBookings || 0}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.6 10.4M7 13l-1.6 10.4" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">Total Events</p>
                <p className="text-2xl font-bold text-yellow-800">{data?.totalEvents || 0}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">Total Tickets</p>
                <p className="text-2xl font-bold text-yellow-800">{data?.totalTickets || 0}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3.28a1 1 0 00.683.693l7.427 2.800a1 1 0 00.917 0l7.427-2.8A1 1 0 0021 10.28V7a2 2 0 00-2-2H5z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-yellow-800 mb-4">Revenue Overview</h2>
          {data?.revenueChart && data.revenueChart.length > 0 ? (
            <div className="h-64">
              <div className="space-y-4">
                {data.revenueChart.map((item, index) => {
                  const maxRevenue = Math.max(...data.revenueChart.map(r => r.revenue));
                  const barWidth = maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0;
                  return (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-yellow-800 font-medium w-16">{item.month}</span>
                      <div className="flex-1 mx-4 bg-yellow-200 rounded-full h-4">
                        <div
                          className="bg-yellow-500 h-4 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(barWidth, 100)}%` }}
                        />
                      </div>
                      <span className="text-yellow-800 font-semibold">₹{item.revenue.toFixed(2)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <p className="text-yellow-600">No revenue data available for the selected period.</p>
          )}
        </div>

        {/* Recent Bookings Table */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-yellow-800 mb-4">Recent Bookings</h2>
          {data?.recentBookings && data.recentBookings.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-yellow-200">
                <thead className="bg-yellow-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-yellow-800 uppercase tracking-wider">Booking ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-yellow-800 uppercase tracking-wider">Client Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-yellow-800 uppercase tracking-wider">Phone</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-yellow-800 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-yellow-800 uppercase tracking-wider">Payment Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-yellow-800 uppercase tracking-wider">Created At</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-yellow-200">
                  {data.recentBookings.slice(0, 5).map((booking) => (
                    <tr key={booking._id} className="hover:bg-yellow-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-900">{booking._id.slice(-8)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-900">{booking.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-900">{booking.phone}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          booking.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          booking.paymentStatus === 'Successfull' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {booking.paymentStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-900">{formatDate(booking.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-yellow-600">No recent bookings available.</p>
          )}
        </div>

        {/* Recent Events Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-yellow-800 mb-4">Recent Events</h2>
          {data?.recentEvents && data.recentEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.recentEvents.map((event) => (
                <div key={event._id} className="border border-yellow-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="relative w-full h-32 mb-3 rounded-md overflow-hidden bg-gray-200">
                    {event.posterImage[0] ? (
                      <img
                        src={event.posterImage[0]}
                        alt={event.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div className="absolute inset-0 flex items-center justify-center text-gray-500 hidden">
                      No Image
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-yellow-800 mb-1 line-clamp-2">{event.title}</h3>
                  <p className="text-yellow-600 mb-2">{event.category}</p>
                  <p className="text-sm text-yellow-700 mb-2">
                    {event.date.length > 0 ? formatDate(event.date[0]) : 'TBD'} | {event.attendeesCount} attendees
                  </p>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    event.status === 'upcoming' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {event.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-yellow-600">No recent events available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default VendorDashboardPage;