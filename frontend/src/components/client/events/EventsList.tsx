import { useState } from 'react';
import { useFindEvents } from '@/hooks/clientCustomHooks';
import { EventCard } from './EventCard';
import { EventsHero } from './EventsHeader'
import { Button } from '@/components/ui/button';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const EventsList = () => {
  const [currentPage, setCurrentPage] = useState(1);
  
  // Using mock data for demonstration - replace with actual API call
  const { data: responseData, isLoading, error } = useFindEvents(currentPage);
  
  // Extract events array from the response object
  const eventsToShow = Array.isArray(responseData?.events) ? responseData.events : [];
  const totalPages = responseData?.totalPages || 1;
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
        <span className="ml-2 text-muted-foreground">Loading amazing events...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="mx-4 mb-8">
        <AlertDescription>
          Failed to load events. Showing demo events instead.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <>
      {/* Events Hero Section */}
      <EventsHero />

      {/* Main Events Content */}
      <div className="container mx-auto px-4 py-8">
      {/* All Events */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-foreground">All Events</h2>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Showing {eventsToShow.length} events</span>
          </div>
        </div>

        {eventsToShow.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-muted-foreground text-lg mb-2">No events found</p>
              <p className="text-muted-foreground text-sm">Try checking back later for upcoming events.</p>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {eventsToShow.map((event: any, index: number) => (
                <EventCard 
                  key={event._id || event.id || `event-${index}`} 
                  event={event} 
                />
              ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-center gap-4 mt-12">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>
              
              <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className={currentPage === page ? 'bg-gradient-primary' : ''}
                  >
                    {page}
                  </Button>
                ))}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => prev + 1)}
                disabled={currentPage >= totalPages}
                className="flex items-center gap-2"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </>
        )}
      </section>
      </div>
    </>
  );
};