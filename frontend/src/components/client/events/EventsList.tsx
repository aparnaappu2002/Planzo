import { useState, useEffect, useCallback, useMemo } from 'react';
import { useFindEvents, useFindEventsBasedOnCategory } from '@/hooks/clientCustomHooks';
import { EventCard } from './EventCard';
import { EventsHero } from './EventsHeader';
import { Button } from '@/components/ui/button';
import { Loader2, ChevronLeft, ChevronRight, X, Info, MapPin, Search, Filter, Calendar } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SearchResults {
  events: any[];
  query?: string;
  totalPages?: number;
  searchType?: 'query' | 'location' | 'category';
  category?: string;
  sortBy?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
}

// Hardcoded categories
const HARDCODED_CATEGORIES = [
  'All Categories',
  'Music',
  'Entertainment', 
  'Workshop',
  'Seminar',
  'Conference',
  
];

// Helper function to check if an event is expired - FIXED VERSION
const isEventExpired = (event: any): boolean => {
  // Handle different date formats
  let dateToCheck = event.date;
  
  // If date is an array, use the first element
  if (Array.isArray(event.date) && event.date.length > 0) {
    dateToCheck = event.date[0];
  }
  
  if (!dateToCheck) {
    
    return false; // If no date, don't filter out
  }
  
  const eventDate = new Date(dateToCheck);
  
  // Check if date parsing was successful
  if (isNaN(eventDate.getTime())) {
    
    return false; // If date is invalid, don't filter out
  }
  
  const today = new Date();
  
  // FIXED: Simple and reliable date comparison using date strings
  const eventDateString = eventDate.toISOString().split('T')[0]; // YYYY-MM-DD
  const todayDateString = today.toISOString().split('T')[0]; // YYYY-MM-DD
  
  const isExpired = eventDateString < todayDateString;
  
  console.log('Date comparison for event:', {
    title: event.title,
    category: event.category, // Add category to debug logs
    eventDateRaw: dateToCheck,
    eventDateString,
    todayDateString,
    isExpired
  });
  
  return isExpired;
};

// Helper function to filter out expired events
const filterActiveEvents = (events: any[]): any[] => {
  console.log('Filtering events:', events.length);
  const filtered = events.filter(event => {
    const isExpired = isEventExpired(event);
    if (isExpired) {
      console.log('Filtering out expired event:', event.title, event.date);
    }
    return !isExpired;
  });
  console.log('Events after filtering:', filtered.length);
  return filtered;
};

export const EventsList = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchResults, setSearchResults] = useState<SearchResults | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchError, setSearchError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedSort, setSelectedSort] = useState('newest');

  // Add state for active category search
  const [activeCategorySearch, setActiveCategorySearch] = useState<{
    category: string;
    sortBy: string;
  } | null>(null);

  // Add state to track if category search returned only expired events
  const [categoryHasOnlyExpiredEvents, setCategoryHasOnlyExpiredEvents] = useState(false);

  // DEBUG: Add temporary state to enable detailed logging
  const [enableDebugLogs] = useState(true); // Set to false to disable

  // Determine data source and fetch strategy
  const isShowingSearchResults = searchResults !== null;
  const isShowingCategoryResults = searchResults?.searchType === 'category';
  const shouldFetchRegularEvents = !isShowingSearchResults && !isSearching;
  
  // Use activeCategorySearch for determining if we should fetch category events
  const shouldFetchCategoryEvents = activeCategorySearch !== null && activeCategorySearch.category !== 'All Categories';

  // Regular events fetch (for default view)
  const { 
    data: regularEventsData, 
    isLoading: regularEventsLoading, 
    error: regularFetchError 
  } = useFindEvents(currentPage, shouldFetchRegularEvents);

  // Category-based events fetch - Use activeCategorySearch
  const categoryToFetch = shouldFetchCategoryEvents ? activeCategorySearch.category : '';
  const sortToUse = shouldFetchCategoryEvents ? activeCategorySearch.sortBy : selectedSort;
  
  
  
  const { 
    data: categoryEventsData, 
    isLoading: categoryEventsLoading, 
    error: categoryFetchError,
    refetch: refetchCategoryEvents
  } = useFindEventsBasedOnCategory(
    categoryToFetch,
    currentPage,
    sortToUse
  );

  // Log hook results and compare with regular events
  useEffect(() => {
    if (shouldFetchCategoryEvents) {
     
    }
    
    // Debug: Log regular events to compare categories
    if (regularEventsData?.events && !isShowingSearchResults) {
      const entertainmentEvents = regularEventsData.events.filter(event => 
        event.category && event.category.toLowerCase().includes('entertainment')
      );
      
    }
  }, [categoryEventsData, categoryEventsLoading, categoryFetchError, categoryToFetch, sortToUse, shouldFetchCategoryEvents, regularEventsData, isShowingSearchResults]);

  // DEBUG: Log all regular events with their categories when component loads
  useEffect(() => {
    if (enableDebugLogs && regularEventsData?.events && !isShowingSearchResults) {
      console.log('=== DEBUG: All regular events with categories ===');
      regularEventsData.events.forEach((event, index) => {
        
      });
      console.log('=== END DEBUG ===');
    }
  }, [regularEventsData, isShowingSearchResults, enableDebugLogs]);

  // Debug logging
  useEffect(() => {
    console.log('EventsList state:', {
      isShowingSearchResults,
      isShowingCategoryResults,
      shouldFetchCategoryEvents,
      categoryToFetch,
      sortToUse,
      activeCategorySearch,
      searchResults: searchResults?.searchType,
      categoryEventsData: categoryEventsData?.events?.length,
      categoryEventsLoading,
      categoryHasOnlyExpiredEvents
    });
  }, [isShowingSearchResults, isShowingCategoryResults, shouldFetchCategoryEvents, categoryToFetch, sortToUse, activeCategorySearch, searchResults, categoryEventsData, categoryEventsLoading, categoryHasOnlyExpiredEvents]);

  // Normalize and filter events data
  const eventsToShow = useMemo(() => {
    let rawEvents: any[] = [];

    

    if (isShowingSearchResults) {
      if (isShowingCategoryResults && categoryEventsData?.events) {
        console.log('Using category events data:', categoryEventsData.events.length);
        // For category searches, use the fresh data from the hook
        rawEvents = categoryEventsData.events;
      } else if (searchResults?.events) {
        console.log('Using search results events:', searchResults.events.length);
        // For other search types, use search results
        rawEvents = searchResults.events;
      }
    } else {
      console.log('Using regular events data:', regularEventsData?.events?.length || 0);
      // Use regular events for default view
      rawEvents = regularEventsData?.events || [];
    }
    
    console.log('Raw events before filtering:', rawEvents.length);
    
    // Filter out expired events
    const filteredEvents = filterActiveEvents(rawEvents);
    console.log('Events after filtering:', filteredEvents.length);
    
    // Check if this is a category search that returned only expired events
    if (isShowingCategoryResults && rawEvents.length > 0 && filteredEvents.length === 0) {
      console.log('Category search returned only expired events');
      setCategoryHasOnlyExpiredEvents(true);
    } else {
      setCategoryHasOnlyExpiredEvents(false);
    }
    
    return filteredEvents;
  }, [isShowingSearchResults, isShowingCategoryResults, searchResults?.events, regularEventsData?.events, categoryEventsData?.events]);

  // Handle totalPages - Use category data for category searches
  const totalPages = useMemo(() => {
    if (isShowingSearchResults) {
      if (isShowingCategoryResults && categoryEventsData?.totalPages !== undefined) {
        // For category searches, if all events are expired, show 1 page
        if (categoryHasOnlyExpiredEvents) {
          return 1;
        }
        return Math.max(categoryEventsData.totalPages, 1);
      }
      if (searchResults?.searchType === 'location') {
        const searchTotalPages = searchResults?.totalPages || 0;
        if (searchTotalPages === 0 && searchResults?.events && searchResults.events.length > 0) {
          return 1;
        }
        return Math.max(searchTotalPages, 1);
      }
      return searchResults?.totalPages || 1;
    }
    return regularEventsData?.totalPages || 1;
  }, [isShowingSearchResults, isShowingCategoryResults, searchResults, regularEventsData, categoryEventsData, categoryHasOnlyExpiredEvents]);

  // Check if search results have limited data
  const hasLimitedSearchData = isShowingSearchResults && 
    searchResults?.searchType === 'query' && 
    eventsToShow.length > 0 && 
    eventsToShow.some(event => !event.date && !event.address && !event.category && event._id && event.title);

  // Check search types
  const isLocationSearch = isShowingSearchResults && searchResults?.searchType === 'location';
  const isCategorySearch = isShowingSearchResults && searchResults?.searchType === 'category';

  // Handle page changes - Refetch category data when page changes
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      const newPage = currentPage - 1;
      setCurrentPage(newPage);
      
      // If showing category results, refetch with new page
      if (isCategorySearch) {
        setTimeout(() => {
          refetchCategoryEvents();
        }, 100);
      }
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      const newPage = currentPage + 1;
      setCurrentPage(newPage);
      
      // If showing category results, refetch with new page
      if (isCategorySearch) {
        setTimeout(() => {
          refetchCategoryEvents();
        }, 100);
      }
    }
  };

  const handlePageClick = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      
      // If showing category results, refetch with new page
      if (isCategorySearch) {
        setTimeout(() => {
          refetchCategoryEvents();
        }, 100);
      }
    }
  };

  // Search handlers - Proper state management
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
      
      // Clear any active category search
      setActiveCategorySearch(null);
      setCategoryHasOnlyExpiredEvents(false);
      
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
      
      // Clear any active category search
      setActiveCategorySearch(null);
      setCategoryHasOnlyExpiredEvents(false);
      
      setSearchResults({
        ...results,
        events: activeEvents,
        searchType: 'location',
        totalPages: results.totalPages === 0 && activeEvents.length > 0 ? 1 : (results.totalPages || 1)
      });
    } else if (results.searchType === 'category') {
      // For category-based search, set up the active category search
      console.log('Setting up category search:', results.category, results.sortBy);
      
      // Set the active category search which will trigger the hook
      setActiveCategorySearch({
        category: results.category || 'All Categories',
        sortBy: results.sortBy || 'newest'
      });
      
      // Update selected category and sort if it's a category search
      setSelectedCategory(results.category || 'All Categories');
      setSelectedSort(results.sortBy || 'newest');
      setCurrentPage(1); // Reset to first page for category searches
      
      // Set search results - events will be populated by the hook
      setSearchResults({
        ...results,
        events: [], // Will be populated by the hook
        searchType: 'category'
      });
      
      // Reset expired events flag
      setCategoryHasOnlyExpiredEvents(false);
    } else {
      // Fallback for other cases - still filter expired events
      const activeEvents = filterActiveEvents(results.events || []);
      
      // Clear any active category search
      setActiveCategorySearch(null);
      setCategoryHasOnlyExpiredEvents(false);
      
      setSearchResults({
        ...results,
        events: activeEvents
      });
    }
    
    setIsSearching(false);
    setSearchError(null);
    setSearchQuery(results?.query || '');
  }, [refetchCategoryEvents]);

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
    setActiveCategorySearch(null);
    setCategoryHasOnlyExpiredEvents(false);
    setSearchQuery('');
  }, []);

  const clearSearchResults = useCallback(() => {
    console.log('Clearing search results');
    setSearchResults(null);
    setActiveCategorySearch(null);
    setCategoryHasOnlyExpiredEvents(false);
    setSearchQuery('');
    setSearchError(null);
    setSelectedCategory('All Categories');
    setSelectedSort('newest');
    setCurrentPage(1);
  }, []);

  // Reset search error when starting new search
  useEffect(() => {
    if (isSearching) {
      setSearchError(null);
    }
  }, [isSearching]);

  // Handle category events data updates and force refetch when activeCategorySearch changes
  useEffect(() => {
    if (activeCategorySearch && activeCategorySearch.category !== 'All Categories') {
      console.log('activeCategorySearch changed, forcing refetch:', activeCategorySearch);
      // Small delay to ensure hook parameters are updated
      const timer = setTimeout(() => {
        refetchCategoryEvents();
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [activeCategorySearch, refetchCategoryEvents]);

  // Handle category events data updates
  useEffect(() => {
    if (isCategorySearch && categoryEventsData?.events && activeCategorySearch) {
      console.log('Category events data received:', categoryEventsData.events.length, 'events');
      console.log('Raw category events:', categoryEventsData.events.map(event => ({
        title: event.title,
        category: event.category,
        date: event.date,
        id: event.id || event._id
      })));
      console.log('Updating search results with category data...');
      
      // Update search results with the actual events data
      setSearchResults(prev => prev ? {
        ...prev,
        events: categoryEventsData.events,
        totalPages: categoryEventsData.totalPages || 1
      } : null);
    }
  }, [categoryEventsData, isCategorySearch, activeCategorySearch]);

  // Determine loading state
  const isLoading = isSearching || 
    (regularEventsLoading && !isShowingSearchResults) || 
    (categoryEventsLoading && isCategorySearch);

  // Loading state
  if (isLoading) {
    return (
      <>
        <EventsHero 
          onSearchResults={handleSearchResults}
          onSearchStart={handleSearchStart}
          onSearchError={handleSearchError}
          categories={HARDCODED_CATEGORIES}
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
  const currentError = searchError || (regularFetchError && !isShowingSearchResults) || (categoryFetchError && isCategorySearch);
  if (currentError) {
    return (
      <>
        <EventsHero 
          onSearchResults={handleSearchResults}
          onSearchStart={handleSearchStart}
          onSearchError={handleSearchError}
          categories={HARDCODED_CATEGORIES}
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
    } else if (isCategorySearch && searchResults?.category) {
      if (categoryHasOnlyExpiredEvents) {
        return `All events in ${searchResults.category} category have already passed`;
      }
      return `Found ${count} upcoming ${eventText} in ${searchResults.category}`;
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
    } else if (isCategorySearch && searchResults?.category) {
      if (categoryHasOnlyExpiredEvents) {
        return `All events in ${searchResults.category} category have already passed`;
      }
      return `No upcoming events found in ${searchResults.category}`;
    } else if (searchResults?.searchType === 'query' && searchQuery) {
      return `No upcoming events found with "${searchQuery}" in the title`;
    } else {
      return "No upcoming events found for your search";
    }
  };

  // Get search result header info
  const getSearchHeaderInfo = () => {
    if (isLocationSearch) {
      return {
        icon: <MapPin className="w-5 h-5 text-green-600" />,
        title: 'Nearby Events',
        titleClass: 'text-green-900',
        bgClass: 'bg-green-50 border-green-200'
      };
    } else if (isCategorySearch) {
      return {
        icon: <Filter className="w-5 h-5 text-purple-600" />,
        title: `${searchResults?.category || 'Category'} Events`,
        titleClass: 'text-purple-900',
        bgClass: 'bg-purple-50 border-purple-200'
      };
    } else {
      return {
        icon: <Search className="w-5 h-5 text-blue-600" />,
        title: `Search Results ${searchQuery && `for "${searchQuery}"`}`,
        titleClass: 'text-blue-900',
        bgClass: 'bg-blue-50 border-blue-200'
      };
    }
  };

  const searchHeaderInfo = getSearchHeaderInfo();

  return (
    <>
      <EventsHero 
        onSearchResults={handleSearchResults}
        onSearchStart={handleSearchStart}
        onSearchError={handleSearchError}
        categories={HARDCODED_CATEGORIES}
      />

      <div className="container mx-auto px-4 py-8">
        {/* Search results header */}
        {isShowingSearchResults && (
          <div className={`mb-6 border rounded-lg p-4 ${searchHeaderInfo.bgClass}`}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  {searchHeaderInfo.icon}
                  <h3 className={`text-lg font-semibold ${searchHeaderInfo.titleClass}`}>
                    {searchHeaderInfo.title}
                  </h3>
                </div>
                <p className={`text-sm ${searchHeaderInfo.titleClass.replace('text-', 'text-').replace('-900', '-700')}`}>
                  {eventsToShow.length > 0 
                    ? getSearchResultsDescription()
                    : getNoResultsMessage()
                  }
                </p>
                {isCategorySearch && searchResults?.sortBy && (
                  <p className={`text-xs mt-1 ${searchHeaderInfo.titleClass.replace('text-', 'text-').replace('-900', '-600')}`}>
                    Sorted by: {searchResults.sortBy.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </p>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={clearSearchResults}
                className="flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                {isLocationSearch ? 'Show All Events' : isCategorySearch ? 'Clear Filter' : 'Clear Search'}
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

            {/* Category search info */}
            {isCategorySearch && (
              <div className="mt-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <Filter className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-purple-700">
                    Showing upcoming events in the {searchResults?.category} category{searchResults?.sortBy ? `, sorted by ${searchResults.sortBy.replace(/([A-Z])/g, ' $1').toLowerCase()}` : ''}.
                  </p>
                </div>
              </div>
            )}

            {/* Special message for categories with only expired events */}
            {categoryHasOnlyExpiredEvents && isCategorySearch && (
              <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <Calendar className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm text-orange-700 font-medium">
                      All events in this category have already passed
                    </p>
                    <p className="text-xs text-orange-600 mt-1">
                      Try selecting a different category or browse all upcoming events to find current events.
                    </p>
                  </div>
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
                ? (isLocationSearch ? 'Nearby Events' : isCategorySearch ? `${searchResults?.category} Events` : 'Search Results')
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
                      : isCategorySearch
                        ? (categoryHasOnlyExpiredEvents 
                          ? "All events in this category have already passed. Try selecting a different category or browse all upcoming events below."
                          : "Try selecting a different category or browse all upcoming events below.")
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

          {/* Pagination - show for regular events and category searches (but not when all events are expired) */}
          {totalPages > 1 && (!isShowingSearchResults || (isCategorySearch && !categoryHasOnlyExpiredEvents)) && (
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