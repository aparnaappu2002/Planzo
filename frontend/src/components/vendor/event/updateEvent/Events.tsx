import React, { useState } from 'react';
import { useFindAllEventsVendorSide, useSearchEventsVendor } from '@/hooks/vendorCustomHooks';
import { useDebounce } from '@/hooks/useDebounce'; // Import debounce hook
import { EventEntity } from '@/types/EventType';
import { EventCard } from './EventCard';
import { EventViewModal } from './EventViewModal';
import { EventEditModal } from './EventEditModal';
import { Input } from '@/components/ui/input';
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
  
  const [pageNo, setPageNo] = useState(1);
  const [localEvents, setLocalEvents] = useState<EventEntity[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<EventEntity | null>(null);
  const [editingEvent, setEditingEvent] = useState<EventEntity | null>(null);
  const [viewingEvent, setViewingEvent] = useState<EventEntity | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Debounce search term to avoid excessive API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 500); // 500ms delay

  // Use search hook when there's a debounced search term, otherwise use find all events
  const { 
    data: searchResponse, 
    isLoading: isSearchLoading, 
    error: searchError 
  } = useSearchEventsVendor({
    vendorId: vendorId || '',
    searchTerm: debouncedSearchTerm,
    pageNo
  });


  const { 
    data: apiResponse, 
    isLoading: isAllEventsLoading, 
    error: allEventsError, 
    refetch 
  } = useFindAllEventsVendorSide(vendorId || '', pageNo);

  // Determine which data source to use
  const isSearchActive = debouncedSearchTerm.trim().length > 0;
  const currentData = isSearchActive ? searchResponse : apiResponse;
  const isLoading = isSearchActive ? isSearchLoading : isAllEventsLoading;
  const error = isSearchActive ? searchError : allEventsError;
  
  const events = localEvents.length > 0 ? localEvents : (currentData?.events || []);
  const totalPages = currentData?.totalPages || 1;

  React.useEffect(() => {
    if (currentData?.events && Array.isArray(currentData.events)) {
      setLocalEvents(currentData.events);
    }
  }, [currentData?.events]);

  // Reset to page 1 when debounced search term changes
  React.useEffect(() => {
    setPageNo(1);
  }, [debouncedSearchTerm]);

  const filteredEvents = React.useMemo(() => {
    if (!events || !Array.isArray(events)) return [];

    return events.filter(event => {
      const matchesStatus = statusFilter === 'all' || event.status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || event.category === categoryFilter;

      return matchesStatus && matchesCategory;
    });
  }, [events, statusFilter, categoryFilter]);

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

  const handleViewEvent = (event: EventEntity) => {
    setViewingEvent(event);
  };

  const handleEditEvent = (event: EventEntity) => {
    setEditingEvent(event);
  };

  const handleCloseModals = () => {
    setViewingEvent(null);
    setEditingEvent(null);
  };

  const handleEventUpdated = async (updatedEvent: EventEntity) => {
    try {
      // Update local state immediately for instant UI feedback
      setLocalEvents(prevEvents => {
        const updated = prevEvents.map(event => 
          event._id === updatedEvent._id ? { ...event, ...updatedEvent } : event
        );
        return updated;
      });
      
      // Invalidate both search and all events queries
      await queryClient.invalidateQueries({ queryKey: ['events', 'search'] });
      await queryClient.invalidateQueries({ queryKey: ['findAllEventsVendorSide'] });
      
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
        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-1/3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search events by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
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