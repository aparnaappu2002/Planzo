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
import { useQueryClient } from '@tanstack/react-query'; // Import useQueryClient

const Events = () => {
  const vendorId = useSelector((state: RootState) => state.vendorSlice.vendor?._id);
  const queryClient = useQueryClient(); // Initialize query client
  console.log(vendorId)
  const [pageNo] = useState(1);
  const [localEvents, setLocalEvents] = useState<EventType[]>([]); // NEW: Local state for events
  const [selectedEvent, setSelectedEvent] = useState<EventType | null>(null);
  const [editingEvent, setEditingEvent] = useState<EventType | null>(null);
  const [viewingEvent, setViewingEvent] = useState<EventType | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const { data: apiResponse, isLoading, error, refetch } = useFindAllEventsVendorSide(vendorId, pageNo);
  
  const events = localEvents.length > 0 ? localEvents : (apiResponse?.events || []);
  console.log('Current events from API:', events);
  
  // Update local events when API data changes
  React.useEffect(() => {
    if (apiResponse?.events && Array.isArray(apiResponse.events)) {
      setLocalEvents(apiResponse.events);
      console.log('Local events updated from API:', apiResponse.events.length);
    }
  }, [apiResponse?.events]);
  
  // DEBUG: Log when data changes
  React.useEffect(() => {
    console.log('Events data updated:', events.length, 'events');
  }, [events]);
  

  
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

  // NEW: Handle event update without page refresh
  const handleEventUpdated = async (updatedEvent: EventType) => {
    console.log('🔄 Handling event update:', updatedEvent._id);
    
    try {
      // 1. Update local state immediately for instant UI feedback
      setLocalEvents(prevEvents => {
        const updated = prevEvents.map(event => 
          event._id === updatedEvent._id ? { ...event, ...updatedEvent } : event
        );
        
        return updated;
      });
      
      // 2. Try to find and invalidate the correct query key
      const possibleQueryKeys = [
        // Common patterns for vendor events
        ['findAllEventsVendorSide', vendorId, pageNo],
        ['findAllEventsVendorSide', vendorId],
        ['vendorEvents', vendorId, pageNo],
        ['vendorEvents', vendorId],
        ['events', 'vendor', vendorId],
        ['events', vendorId, pageNo],
        ['events', vendorId],
        // Without parameters
        ['findAllEventsVendorSide'],
        ['vendorEvents'],
        ['events']
      ];
      
      
      
      // Try invalidating each possible key
      for (const queryKey of possibleQueryKeys) {
        try {
          await queryClient.invalidateQueries({ queryKey });
          
        } catch (error) {
          
        }
      }
      
      // 3. Force complete cache invalidation as backup
      await queryClient.invalidateQueries();
      
      // 4. Force immediate refetch
      const refetchResult = await refetch();
      
      // 5. Update viewing modal if it's the same event
      if (viewingEvent && viewingEvent._id === updatedEvent._id) {
        setViewingEvent(updatedEvent);
      }
      
      // 6. Update editing modal if it's the same event (though it should be closing)
      if (editingEvent && editingEvent._id === updatedEvent._id) {
        setEditingEvent(updatedEvent);
      }
      
      
    } catch (error) {
      
      // Ultimate fallback: Force refetch after a delay
      setTimeout(async () => {
        try {
          await refetch();
        } catch (fallbackError) {
        }
      }, 500);
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
        

        {/* Search and Filters */}
        

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <EventCard
                key={`${event._id || event.id}-${event.updatedAt || Date.now()}`} // Include timestamp to force updates
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
        key={viewingEvent?._id || 'view-modal'} // Force re-render when event changes
      />
      
      <EventEditModal
        event={editingEvent}
        isOpen={!!editingEvent}
        onClose={handleCloseModals}
        onEventUpdated={handleEventUpdated} // NEW: Pass the update handler
        key={editingEvent?._id || 'edit-modal'} // Force re-render when event changes
      />
    </div>
  );
};

export default Events;