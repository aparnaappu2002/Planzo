// components/AdminDashboard.tsx
import React from 'react';
import { useFindDashboardAdminDetails } from '@/hooks/adminCustomHooks';
import { Calendar, Users, DollarSign, ShoppingCart, TrendingUp, Clock, MapPin, Ticket } from 'lucide-react';
import { format } from 'date-fns';

const AdminDashboard: React.FC = () => {
  const adminId = localStorage.getItem('adminId');
  const { data, isLoading, isError } = useFindDashboardAdminDetails(adminId || '');

  if (!adminId) {
    return (
      <div className="min-h-screen bg-yellow-50 flex items-center justify-center">
        <div className="bg-white p-10 rounded-2xl shadow-xl text-center">
          <p className="text-yellow-800 text-xl font-semibold">Please log in as admin</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-yellow-50 flex items-center justify-center">
        <div className="text-yellow-700 text-xl">Loading dashboard...</div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="min-h-screen bg-yellow-50 flex items-center justify-center">
        <div className="bg-white p-10 rounded-2xl shadow-xl text-center">
          <p className="text-red-600 text-xl font-semibold">Failed to load dashboard data</p>
        </div>
      </div>
    );
  }

  const { totalBookings, totalClients, totalVendors, totalRevenue, bookings, events, eventDetailsForGraph } = data;

  return (
    <div className="min-h-screen bg-yellow-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-yellow-400 to-amber-400 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-4xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-yellow-100 mt-2">Welcome back! Here's what's happening today.</p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-white rounded-2xl shadow-md p-6 border border-yellow-200 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-600 text-sm font-medium">Total Bookings</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">{totalBookings}</p>
              </div>
              <ShoppingCart className="w-12 h-12 text-yellow-500 opacity-80" />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6 border border-yellow-200 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-600 text-sm font-medium">Total Clients</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">{totalClients}</p>
              </div>
              <Users className="w-12 h-12 text-yellow-500 opacity-80" />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6 border border-yellow-200 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-600 text-sm font-medium">Total Vendors</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">{totalVendors}</p>
              </div>
              <TrendingUp className="w-12 h-12 text-yellow-500 opacity-80" />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6 border border-yellow-200 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-600 text-sm font-medium">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">₹{totalRevenue.toFixed(2)}</p>
              </div>
              <DollarSign className="w-12 h-12 text-yellow-500 opacity-80" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Bookings */}
          <div className="bg-white rounded-2xl shadow-md border border-yellow-200 p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-yellow-600" />
              Recent Bookings
            </h2>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {bookings.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No bookings yet</p>
              ) : (
                bookings.map((booking: any) => (
                  <div key={booking._id} className="flex items-center justify-between p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                    <div className="flex items-center gap-4">
                      <img
                        src={booking.clientId.profileImage || '/default-avatar.png'}
                        alt={booking.clientId.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-yellow-300"
                      />
                      <div>
                        <p className="font-semibold text-gray-800">{booking.clientId.name}</p>
                        <p className="text-sm text-gray-600">{booking.serviceId.serviceTitle}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs font-medium px-3 py-1 rounded-full ${
                        booking.paymentStatus === 'Pending' ? 'bg-orange-100 text-orange-700' :
                        booking.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {booking.paymentStatus} • {booking.status}
                      </span>
                      <p className="text-sm text-gray-500 mt-1">
                        {format(new Date(booking.date[0]), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="bg-white rounded-2xl shadow-md border border-yellow-200 p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Ticket className="w-6 h-6 text-yellow-600" />
              Upcoming Events
            </h2>
            <div className="space-y-4">
              {events.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No events scheduled</p>
              ) : (
                events.map((event: any) => (
                  <div key={event._id} className="flex gap-4 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                    <img
                      src={event.posterImage[0]}
                      alt={event.title}
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800">{event.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                        <MapPin className="w-4 h-4" />
                        {event.venueName}, {event.address}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                        <Clock className="w-4 h-4" />
                        {format(new Date(event.date[0]), 'MMM dd, yyyy • h:mm a')}
                      </div>
                      <div className="mt-2">
                        <span className="text-xs font-medium px-3 py-1 bg-green-100 text-green-700 rounded-full">
                          {event.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Event Summary */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-gradient-to-r from-yellow-400 to-amber-400 text-white rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold">Active Events</h3>
            <p className="text-4xl font-bold mt-2">{eventDetailsForGraph.activeEvents}</p>
          </div>
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold">Upcoming Events</h3>
            <p className="text-4xl font-bold mt-2">{eventDetailsForGraph.statusCount.upcoming}</p>
          </div>
          <div className="bg-gradient-to-r from-lime-400 to-green-500 text-white rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold">Total Events</h3>
            <p className="text-4xl font-bold mt-2">{eventDetailsForGraph.totalEvents}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;