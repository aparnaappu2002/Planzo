
import React, { useState } from 'react';
import { useFindAllEventsVendorSide } from '@/hooks/vendorCustomHooks';
import { EventType } from '@/types/EventType';
import { EventCard } from './EventCard';
import { EventViewModal } from './EventViewModal';
import { EventEditModal } from './EventEditModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  CalendarDays, 
  Search, 
  Filter, 
  Plus,
  TrendingUp,
  Users,
  DollarSign
} from 'lucide-react';
import { RootState } from '@/redux/Store';
import { useSelector } from 'react-redux';
import { useQueryClient } from '@tanstack/react-query';
import Pagination from '@/components/other components/Pagination';

const Events = () => {
  const vendorId = useSelector((state: RootState) => state.vendorSlice.vendor?._id);
  const queryClient = useQueryClient();
  
  const [pageNo, setPageNo] = useState(1); // Updated to dynamic state
  const [localEvents, setLocalEvents] = useState<EventType[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<EventType | null>(null);
  const [editingEvent, setEditingEvent] = useState<EventType | null>(null);
  const [viewingEvent, setViewingEvent] = useState<EventType | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const { data: apiResponse, isLoading, error, refetch } = useFindAllEventsVendorSide(vendorId, pageNo);
  
  const events = localEvents.length > 0 ? localEvents : (apiResponse?.events || []);
  const totalPages = apiResponse?.totalPages || 1; // Extract totalPages from API response

  React.useEffect(() => {
    if (apiResponse?.events && Array.isArray(apiResponse.events)) {
      setLocalEvents(apiResponse.events);
    }
  }, [apiResponse?.events]);

  // DEBUG: Log when data changes
  React.useEffect(() => {
  }, [events, pageNo, totalPages]);

  const filteredEvents = React.useMemo(() => {
    if (!events || !Array.isArray(events)) return [];

    return events.filter(event => {
      const matchesSearch = event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           event.category?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || event.status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || event.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [events, searchTerm, statusFilter, categoryFilter]);

  const stats = React.useMemo(() => {
    if (!events || !Array.isArray(events)) return { totalEvents: 0, totalRevenue: 0, totalTicketsSold: 0, averageAttendance: 0 };

    const totalEvents = events.length;
    const totalRevenue = events.reduce((sum, event) => sum + ((event.ticketPurchased || 0) * (event.pricePerTicket || 0)), 0);
    const totalTicketsSold = events.reduce((sum, event) => sum + (event.ticketPurchased || 0), 0);
    const totalTicketsAvailable = events.reduce((sum, event) => sum + (event.totalTicket || 0), 0);
    const averageAttendance = totalTicketsAvailable > 0 ? (totalTicketsSold / totalTicketsAvailable) * 100 : 0;

    return { totalEvents, totalRevenue, totalTicketsSold, averageAttendance };
  }, [events]);

  const categories = React.useMemo(() => {
    if (!events || !Array.isArray(events)) return [];
    return [...new Set(events.map(event => event.category).filter(Boolean))];
  }, [events]);

  const handleViewEvent = (event: EventType) => {
    setViewingEvent(event);
  };

  const handleEditEvent = (event: EventType) => {
    setEditingEvent(event);
  };

  const handleCloseModals = () => {
    setViewingEvent(null);
    setEditingEvent(null);
  };

  const handleEventUpdated = async (updatedEvent: EventType) => {
    
    try {
      // Update local state immediately for instant UI feedback
      setLocalEvents(prevEvents => {
        const updated = prevEvents.map(event => 
          event._id === updatedEvent._id ? { ...event, ...updatedEvent } : event
        );
        return updated;
      });
      
      // Try to find and invalidate the correct query key
      const possibleQueryKeys = [
        ['findAllEventsVendorSide', vendorId, pageNo],
        ['findAllEventsVendorSide', vendorId],
        ['vendorEvents', vendorId, pageNo],
        ['vendorEvents', vendorId],
        ['events', 'vendor', vendorId],
        ['events', vendorId, pageNo],
        ['events', vendorId],
        ['findAllEventsVendorSide'],
        ['vendorEvents'],
        ['events']
      ];
      
      // Try invalidating each possible key
      for (const queryKey of possibleQueryKeys) {
        try {
          await queryClient.invalidateQueries({ queryKey });
        } catch (error) {
          console.log('Failed to invalidate query key:', queryKey);
        }
      }
      
      // Force complete cache invalidation as backup
      await queryClient.invalidateQueries();
      
      // Force immediate refetch
      const refetchResult = await refetch();
      
      // Update viewing modal if it's the same event
      if (viewingEvent && viewingEvent._id === updatedEvent._id) {
        setViewingEvent(updatedEvent);
      }
      
      // Update editing modal if it's the same event
      if (editingEvent && editingEvent._id === updatedEvent._id) {
        setEditingEvent(updatedEvent);
      }
      
    } catch (error) {
      console.error('Error handling event update:', error);
      // Fallback: Force refetch after a delay
      setTimeout(async () => {
        try {
          await refetch();
        } catch (fallbackError) {
          console.error('Fallback refetch failed:', fallbackError);
        }
      }, 500);
    }
  };

  // Handle page change
  const handleSetPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setPageNo(page);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-destructive text-xl font-semibold">Error loading events</div>
          <p className="text-muted-foreground">Please try refreshing the page</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      {/* Header */}
      <div className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <CalendarDays className="h-8 w-8 text-primary" />
                Event Management
              </h1>
              <p className="text-muted-foreground mt-2">
                Manage and track your events, sales, and performance
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-card p-6 rounded-lg shadow-sm border border-border/50">
            <div className="flex items-center gap-4">
              <CalendarDays className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Events</p>
                <p className="text-2xl font-bold">{stats.totalEvents}</p>
              </div>
            </div>
          </div>
          
          
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-1/3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border rounded-lg px-4 py-2 bg-background"
            >
              <option value="all">All Statuses</option>
              <option value="upcoming">Upcoming</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
            </select>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="border rounded-lg px-4 py-2 bg-background"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Events Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="space-y-4">
                <Skeleton className="h-48 w-full rounded-lg" />
                <div className="space-y-2">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredEvents.length > 0 ? (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => (
                <EventCard
                  key={`${event._id || event.id}-${event.updatedAt || Date.now()}`}
                  event={event}
                  onView={(eventData) => {
                    console.log('🎯 EventCard triggered view for:', eventData._id);
                    handleViewEvent(eventData);
                  }}
                  onEdit={(eventData) => {
                    console.log('🎯 EventCard triggered edit for:', eventData._id);
                    handleEditEvent(eventData);
                  }}
                />
              ))}
            </div>
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12">
                <Pagination
                  total={totalPages}
                  current={pageNo}
                  setPage={handleSetPage}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <CalendarDays className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No events found</h3>
            <p className="text-muted-foreground">
              {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all'
                ? 'Try adjusting your search criteria or filters'
                : 'Get started by creating your first event'}
            </p>
          </div>
        )}
      </div>

      {/* Modals */}
      <EventViewModal
        event={viewingEvent}
        isOpen={!!viewingEvent}
        onClose={handleCloseModals}
        key={viewingEvent?._id || 'view-modal'}
      />
      
      <EventEditModal
        event={editingEvent}
        isOpen={!!editingEvent}
        onClose={handleCloseModals}
        onEventUpdated={handleEventUpdated}
        key={editingEvent?._id || 'edit-modal'}
      />
    </div>
  );
};

export default Events;
