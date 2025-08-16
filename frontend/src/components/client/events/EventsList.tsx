import { useState, useEffect, useCallback, useMemo } from 'react';
import { useFindEvents } from '@/hooks/clientCustomHooks';
import { EventCard } from './EventCard';
import { EventsHero } from './EventsHeader';
import { Button } from '@/components/ui/button';
import { Loader2, ChevronLeft, ChevronRight, X, Info, MapPin, Search } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SearchResults {
  events: any[];
  query?: string;
  totalPages?: number;
  searchType?: 'query' | 'location';
  location?: {
    latitude: number;
    longitude: number;
  };
}

// Helper function to check if an event is expired
const isEventExpired = (event: any): boolean => {
  if (!event.date) return false; // If no date, don't filter out
  
  const now = new Date();
  const eventDate = new Date(event.date);
  
  // Reset time to compare only dates
  now.setHours(0, 0, 0, 0);
  eventDate.setHours(0, 0, 0, 0);
  
  return eventDate < now;
};

// Helper function to filter out expired events
const filterActiveEvents = (events: any[]): any[] => {
  return events.filter(event => !isEventExpired(event));
};

export const EventsList = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchResults, setSearchResults] = useState<SearchResults | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchError, setSearchError] = useState<string | null>(null);

  // Determine which events to show
  const isShowingSearchResults = searchResults !== null;
  const shouldFetchEvents = !isShowingSearchResults && !isSearching;
  
  // Fetch events data
  const { 
    data: responseData, 
    isLoading, 
    error: fetchError 
  } = useFindEvents(currentPage, shouldFetchEvents);

  // Normalize and filter events data
  const eventsToShow = useMemo(() => {
    const rawEvents = isShowingSearchResults 
      ? searchResults?.events || []
      : responseData?.events || [];
    
    // Filter out expired events
    return filterActiveEvents(rawEvents);
  }, [isShowingSearchResults, searchResults?.events, responseData?.events]);

  // Handle totalPages - fix for location-based search returning 0
  const totalPages = useMemo(() => {
    if (isShowingSearchResults) {
      // For location-based search, if totalPages is 0 or undefined, calculate it
      const searchTotalPages = searchResults?.totalPages || 0;
      if (searchTotalPages === 0 && searchResults?.events && searchResults.events.length > 0) {
        // If we have events but totalPages is 0, assume it's page 1 of 1
        return 1;
      }
      return Math.max(searchTotalPages, 1);
    }
    return responseData?.totalPages || 1;
  }, [isShowingSearchResults, searchResults, responseData]);

  // Check if search results have limited data (only _id, title, posterImage)
  const hasLimitedSearchData = isShowingSearchResults && 
    searchResults?.searchType === 'query' && 
    eventsToShow.length > 0 && 
    eventsToShow.some(event => !event.date && !event.address && !event.category && event._id && event.title);

  // Check if this is a location-based search
  const isLocationSearch = isShowingSearchResults && searchResults?.searchType === 'location';

  // Handle page changes
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePageClick = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Search handlers
  const handleSearchResults = useCallback((results: SearchResults) => {
    console.log('Received search results:', results);
    
    // Handle different search types
    if (results.searchType === 'query' && results.query && results.events) {
      // Filter out events that don't match the search query in title for query-based search
      const query = results.query.toLowerCase();
      const filteredEvents = results.events.filter(event => 
        event.title && event.title.toLowerCase().includes(query)
      );
      
      // Also filter out expired events
      const activeEvents = filterActiveEvents(filteredEvents);
      
      if (activeEvents.length === 0) {
        setSearchResults({
          events: [],
          query: results.query,
          totalPages: 1,
          searchType: 'query'
        });
      } else {
        setSearchResults({
          ...results,
          events: activeEvents,
          searchType: 'query'
        });
      }
    } else if (results.searchType === 'location') {
      // For location-based search, filter out expired events
      const activeEvents = filterActiveEvents(results.events || []);
      
      setSearchResults({
        ...results,
        events: activeEvents,
        searchType: 'location',
        // Fix totalPages if it's 0
        totalPages: results.totalPages === 0 && activeEvents.length > 0 ? 1 : (results.totalPages || 1)
      });
    } else {
      // Fallback for other cases - still filter expired events
      const activeEvents = filterActiveEvents(results.events || []);
      setSearchResults({
        ...results,
        events: activeEvents
      });
    }
    
    setIsSearching(false);
    setSearchError(null);
    setSearchQuery(results?.query || '');
  }, []);

  const handleSearchStart = useCallback(() => {
    console.log('Search started');
    setIsSearching(true);
    setSearchError(null);
  }, []);

  const handleSearchError = useCallback((error: any) => {
    console.error('Search error:', error);
    setIsSearching(false);
    setSearchError(error?.message || 'Failed to search events');
    setSearchResults(null);
    setSearchQuery('');
  }, []);

  const clearSearchResults = useCallback(() => {
    console.log('Clearing search results');
    setSearchResults(null);
    setSearchQuery('');
    setSearchError(null);
    setCurrentPage(1);
  }, []);

  // Reset search error when starting new search
  useEffect(() => {
    if (isSearching) {
      setSearchError(null);
    }
  }, [isSearching]);

  // Loading state
  if (isSearching || (isLoading && !isShowingSearchResults)) {
    return (
      <>
        <EventsHero 
          onSearchResults={handleSearchResults}
          onSearchStart={handleSearchStart}
          onSearchError={handleSearchError}
        />
        <div className="flex flex-col items-center justify-center py-12 gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="text-muted-foreground">
            {isSearching ? 'Searching events...' : 'Loading events...'}
          </span>
        </div>
      </>
    );
  }

  // Error states
  if ((fetchError && !isShowingSearchResults) || searchError) {
    return (
      <>
        <EventsHero 
          onSearchResults={handleSearchResults}
          onSearchStart={handleSearchStart}
          onSearchError={handleSearchError}
        />
        <div className="container mx-auto px-4 py-8">
          <Alert variant="destructive">
            <AlertDescription>
              {searchError || 'Failed to load events. Please try again later.'}
            </AlertDescription>
          </Alert>
        </div>
      </>
    );
  }

  // Pagination helpers
  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    
    const start = Math.max(1, currentPage - delta);
    const end = Math.min(totalPages, currentPage + delta);
    
    if (start > 1) {
      range.push(1);
      if (start > 2) range.push('...');
    }
    
    for (let i = start; i <= end; i++) {
      range.push(i);
    }
    
    if (end < totalPages) {
      if (end < totalPages - 1) range.push('...');
      range.push(totalPages);
    }
    
    return range;
  };

  // Get search results description
  const getSearchResultsDescription = () => {
    if (!isShowingSearchResults) return '';
    
    const count = eventsToShow.length;
    const eventText = count !== 1 ? 'events' : 'event';
    
    if (isLocationSearch) {
      return `Found ${count} upcoming ${eventText} near your location`;
    } else if (searchResults?.searchType === 'query' && searchQuery) {
      return `Found ${count} upcoming ${eventText} with matching titles`;
    } else {
      return `Found ${count} upcoming ${eventText}`;
    }
  };

  // Get no results message
  const getNoResultsMessage = () => {
    if (isLocationSearch) {
      return "No upcoming events found near your location";
    } else if (searchResults?.searchType === 'query' && searchQuery) {
      return `No upcoming events found with "${searchQuery}" in the title`;
    } else {
      return "No upcoming events found for your search";
    }
  };

  return (
    <>
      <EventsHero 
        onSearchResults={handleSearchResults}
        onSearchStart={handleSearchStart}
        onSearchError={handleSearchError}
      />

      <div className="container mx-auto px-4 py-8">
        {/* Search results header */}
        {isShowingSearchResults && (
          <div className={`mb-6 border rounded-lg p-4 ${
            isLocationSearch 
              ? 'bg-green-50 border-green-200' 
              : 'bg-blue-50 border-blue-200'
          }`}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  {isLocationSearch ? (
                    <MapPin className="w-5 h-5 text-green-600" />
                  ) : (
                    <Search className="w-5 h-5 text-blue-600" />
                  )}
                  <h3 className={`text-lg font-semibold ${
                    isLocationSearch ? 'text-green-900' : 'text-blue-900'
                  }`}>
                    {isLocationSearch ? 'Nearby Events' : `Search Results ${searchQuery && `for "${searchQuery}"`}`}
                  </h3>
                </div>
                <p className={`text-sm ${
                  isLocationSearch ? 'text-green-700' : 'text-blue-700'
                }`}>
                  {eventsToShow.length > 0 
                    ? getSearchResultsDescription()
                    : getNoResultsMessage()
                  }
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={clearSearchResults}
                className="flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                {isLocationSearch ? 'Show All Events' : 'Clear Search'}
              </Button>
            </div>
            
            {/* Info about limited search data - only for query-based search */}
            {hasLimitedSearchData && (
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-yellow-700">
                    Search results show basic information only. Click "View Details" on any event to see full information including date, location, and pricing.
                  </p>
                </div>
              </div>
            )}

            {/* Location search info */}
            {isLocationSearch && searchResults?.location && (
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-green-700">
                    Showing upcoming events within 25km of your current location. Events are sorted by proximity to you.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Events section */}
        <section>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              {isShowingSearchResults 
                ? (isLocationSearch ? 'Nearby Events' : 'Search Results')
                : 'Upcoming Events'
              }
            </h2>
            {!isShowingSearchResults && (
              <div className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages} • {eventsToShow.length} events
              </div>
            )}
            {isShowingSearchResults && eventsToShow.length > 0 && (
              <div className="text-sm text-muted-foreground">
                {eventsToShow.length} event{eventsToShow.length !== 1 ? 's' : ''} found
              </div>
            )}
          </div>

          {/* Events grid */}
          {eventsToShow.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
              <p className="text-muted-foreground text-lg">
                {isShowingSearchResults 
                  ? getNoResultsMessage()
                  : "No upcoming events found on this page"
                }
              </p>
              {isShowingSearchResults ? (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    {isLocationSearch 
                      ? "Try searching for specific event types or browse all upcoming events below."
                      : "Try searching for different keywords or browse all upcoming events below."
                    }
                  </p>
                  <Button
                    variant="outline"
                    onClick={clearSearchResults}
                  >
                    Browse All Upcoming Events
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-muted-foreground text-sm">
                    The events on this page may have expired or been removed
                  </p>
                  {currentPage > 1 && (
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage(1)}
                    >
                      Go to First Page
                    </Button>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {eventsToShow.map((event) => (
                <EventCard 
                  key={event.id || event._id} 
                  event={event} 
                  isSearchResult={isShowingSearchResults}
                  isLocationBased={isLocationSearch}
                />
              ))}
            </div>
          )}

          {/* Pagination - show for regular events even if current page is empty */}
          {totalPages > 1 && !isShowingSearchResults && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreviousPage}
                  disabled={currentPage <= 1}
                  className="gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>

                <div className="flex items-center gap-1">
                  {getVisiblePages().map((page, index) => (
                    <div key={`page-${index}`}>
                      {page === '...' ? (
                        <span className="px-3 py-1 text-muted-foreground">...</span>
                      ) : (
                        <Button
                          variant={currentPage === page ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handlePageClick(page as number)}
                          className="min-w-[40px]"
                        >
                          {page}
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={currentPage >= totalPages}
                  className="gap-2"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </section>
      </div>
    </>
  );
};