import { useState, useEffect, useCallback, useMemo } from 'react';
import { useFindEvents, useFindEventsBasedOnCategory, useFindCategoryClient } from '@/hooks/clientCustomHooks';
import { EventCard } from './EventCard';
import { EventsHero } from './EventsHeader';
import { Button } from '@/components/ui/button';
import { Loader2, ChevronLeft, ChevronRight, X, Info, MapPin, Search, Filter, Calendar } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Pagination from '@/components/other components/Pagination';

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

const isEventExpired = (event: any): boolean => {
  let dateToCheck = event.date;
  if (Array.isArray(event.date) && event.date.length > 0) {
    dateToCheck = event.date[0];
  }
  if (!dateToCheck) {
    return false;
  }
  const eventDate = new Date(dateToCheck);
  if (isNaN(eventDate.getTime())) {
    return false;
  }
  const today = new Date();
  const eventDateString = eventDate.toISOString().split('T')[0];
  const todayDateString = today.toISOString().split('T')[0];
  const isExpired = eventDateString < todayDateString;
  
  return isExpired;
};

// Helper function to filter out expired events
const filterActiveEvents = (events: any[]): any[] => {
  const filtered = events.filter(event => {
    const isExpired = isEventExpired(event);
    if (isExpired) {
    }
    return !isExpired;
  });
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
  const [activeCategorySearch, setActiveCategorySearch] = useState<{
    category: string;
    sortBy: string;
  } | null>(null);
  const [categoryHasOnlyExpiredEvents, setCategoryHasOnlyExpiredEvents] = useState(false);
  const [enableDebugLogs] = useState(true);

  // Fetch categories using the useFindCategoryClient hook
  const { 
    data: categoriesData, 
    isLoading: categoriesLoading, 
    error: categoriesError 
  } = useFindCategoryClient();

  // Process categories data
  const categories = useMemo(() => {
    if (categoriesError || !categoriesData) {
      return ['All Categories'];
    }
    const rawCategories = categoriesData.categories || categoriesData;
    const fetchedCategories = Array.isArray(rawCategories)
      ? rawCategories
          .map(category => {
            if (typeof category === 'string') {
              return category;
            } else if (category && typeof category === 'object' && category.title) {
              return category.title;
            }
            return null;
          })
          .filter((title): title is string => typeof title === 'string' && title.trim() !== '')
      : [];
    const uniqueCategories = ['All Categories', ...new Set(fetchedCategories)];
    return uniqueCategories;
  }, [categoriesData, categoriesError]);

  // Debug: Log categories passed to EventsHero
  useEffect(() => {
  }, [categories]);

  // Determine data source and fetch strategy
  const isShowingSearchResults = searchResults !== null;
  const isShowingCategoryResults = searchResults?.searchType === 'category';
  const shouldFetchRegularEvents = !isShowingSearchResults && !isSearching;
  const shouldFetchCategoryEvents = activeCategorySearch !== null && activeCategorySearch.category !== 'All Categories';

  // Regular events fetch
  const { 
    data: regularEventsData, 
    isLoading: regularEventsLoading, 
    error: regularFetchError 
  } = useFindEvents(currentPage);

  // Category-based events fetch
  const categoryToFetch = shouldFetchCategoryEvents ? activeCategorySearch.category : '';
  const sortToUse = shouldFetchCategoryEvents ? activeCategorySearch.sortBy : selectedSort;
  const { 
    data: categoryEventsData, 
    isLoading: categoryEventsLoading, 
    error: categoryFetchError,
    refetch: refetchCategoryEvents
  } = useFindEventsBasedOnCategory(categoryToFetch, currentPage, sortToUse);

  // Log hook results and compare with regular events
  useEffect(() => {
    if (shouldFetchCategoryEvents) {
    }
    if (regularEventsData?.events && !isShowingSearchResults) {
      const entertainmentEvents = regularEventsData.events.filter(event => 
        event.category && event.category.toLowerCase().includes('entertainment')
      );
    }
  }, [categoryEventsData, categoryEventsLoading, categoryFetchError, categoryToFetch, sortToUse, shouldFetchCategoryEvents, regularEventsData, isShowingSearchResults]);

  // Debug logging for regular events
  useEffect(() => {
    if (enableDebugLogs && regularEventsData?.events && !isShowingSearchResults) {
      regularEventsData.events.forEach((event, index) => {
      });
    }
  }, [regularEventsData, isShowingSearchResults, enableDebugLogs]);

  
  const eventsToShow = useMemo(() => {
    let rawEvents: any[] = [];
    if (isShowingSearchResults) {
      if (isShowingCategoryResults && categoryEventsData?.events) {
        rawEvents = categoryEventsData.events;
      } else if (searchResults?.events) {
        rawEvents = searchResults.events;
      }
    } else {
      rawEvents = regularEventsData?.events || [];
    }
    const filteredEvents = filterActiveEvents(rawEvents);
    if (isShowingCategoryResults && rawEvents.length > 0 && filteredEvents.length === 0) {
      setCategoryHasOnlyExpiredEvents(true);
    } else {
      setCategoryHasOnlyExpiredEvents(false);
    }
    return filteredEvents;
  }, [isShowingSearchResults, isShowingCategoryResults, searchResults?.events, regularEventsData?.events, categoryEventsData?.events]);

  // Handle totalPages
  const totalPages = useMemo(() => {
    if (isShowingSearchResults) {
      if (isShowingCategoryResults && categoryEventsData?.totalPages !== undefined) {
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

  const isLocationSearch = isShowingSearchResults && searchResults?.searchType === 'location';
  const isCategorySearch = isShowingSearchResults && searchResults?.searchType === 'category';

  // Handle page changes for category searches
  const handleSetPage = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      if (isCategorySearch) {
        setTimeout(() => {
          refetchCategoryEvents();
        }, 100);
      }
    }
  }, [totalPages, isCategorySearch, refetchCategoryEvents]);

  // Search handlers
  const handleSearchResults = useCallback((results: SearchResults) => {
    if (results.searchType === 'query' && results.query && results.events) {
      const query = results.query.toLowerCase();
      const filteredEvents = results.events.filter(event => 
        event.title && event.title.toLowerCase().includes(query)
      );
      const activeEvents = filterActiveEvents(filteredEvents);
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
      const activeEvents = filterActiveEvents(results.events || []);
      setActiveCategorySearch(null);
      setCategoryHasOnlyExpiredEvents(false);
      setSearchResults({
        ...results,
        events: activeEvents,
        searchType: 'location',
        totalPages: results.totalPages === 0 && activeEvents.length > 0 ? 1 : (results.totalPages || 1)
      });
    } else if (results.searchType === 'category') {
      setActiveCategorySearch({
        category: results.category || 'All Categories',
        sortBy: results.sortBy || 'newest'
      });
      setSelectedCategory(results.category || 'All Categories');
      setSelectedSort(results.sortBy || 'newest');
      setCurrentPage(1);
      setSearchResults({
        ...results,
        events: [],
        searchType: 'category'
      });
      setCategoryHasOnlyExpiredEvents(false);
    } else {
      const activeEvents = filterActiveEvents(results.events || []);
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
    setIsSearching(true);
    setSearchError(null);
  }, []);

  const handleSearchError = useCallback((error: any) => {
    setIsSearching(false);
    setSearchError(error?.message || 'Failed to search events');
    setSearchResults(null);
    setActiveCategorySearch(null);
    setCategoryHasOnlyExpiredEvents(false);
    setSearchQuery('');
  }, []);

  const clearSearchResults = useCallback(() => {
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

  // Handle category events data updates
  useEffect(() => {
    if (activeCategorySearch && activeCategorySearch.category !== 'All Categories') {
      const timer = setTimeout(() => {
        refetchCategoryEvents();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [activeCategorySearch, refetchCategoryEvents]);

  useEffect(() => {
    if (isCategorySearch && categoryEventsData?.events && activeCategorySearch) {
      setSearchResults(prev => prev ? {
        ...prev,
        events: categoryEventsData.events,
        totalPages: categoryEventsData.totalPages || 1
      } : null);
    }
  }, [categoryEventsData, isCategorySearch, activeCategorySearch]);

  // Combined loading state
  const isLoading = isSearching || 
    (regularEventsLoading && !isShowingSearchResults) || 
    (categoryEventsLoading && isCategorySearch) || 
    categoriesLoading;

  // Combined error state
  const currentError = searchError || 
    (regularFetchError && !isShowingSearchResults) || 
    (categoryFetchError && isCategorySearch) || 
    categoriesError;

  // Loading state
  if (isLoading) {
    return (
      <>
        <EventsHero 
          onSearchResults={handleSearchResults}
          onSearchStart={handleSearchStart}
          onSearchError={handleSearchError}
          categories={categories}
        />
        <div className="flex flex-col items-center justify-center py-12 gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="text-muted-foreground">
            {isSearching ? 'Searching events...' : categoriesLoading ? 'Loading categories...' : 'Loading events...'}
          </span>
        </div>
      </>
    );
  }

  // Error state
  if (currentError) {
    return (
      <>
        <EventsHero 
          onSearchResults={handleSearchResults}
          onSearchStart={handleSearchStart}
          onSearchError={handleSearchError}
          categories={categories}
        />
        <div className="container mx-auto px-4 py-8">
          <Alert variant="destructive">
            <AlertDescription>
              {searchError || categoriesError?.message || 'Failed to load events or categories. Please try again later.'}
            </AlertDescription>
          </Alert>
        </div>
      </>
    );
  }

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

  // Get search header info
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
        categories={categories}
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
            <div className="mt-12">
              <Pagination
                total={totalPages}
                current={currentPage}
                setPage={handleSetPage}
              />
            </div>
          )}
        </section>
      </div>
    </>
  );
};