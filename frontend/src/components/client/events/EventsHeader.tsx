import { Search, Filter, Calendar, MapPin, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';
import useClientLocation from '@/hooks/locationCutsomHooks';
import { useFindEventsOnQuery, useFindEventsNearToUser } from '@/hooks/clientCustomHooks';

interface EventsHeroProps {
  onSearchResults?: (results: any) => void;
  onSearchStart?: () => void;
  onSearchError?: (error: any) => void;
}

export const EventsHero = ({ onSearchResults, onSearchStart, onSearchError }: EventsHeroProps) => {
  const { location, error: locationError } = useClientLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'query' | 'location'>('query');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchRange, setSearchRange] = useState(25000); 
  
  const findEvents = useFindEventsOnQuery();
  const findEventsNearby = useFindEventsNearToUser();

  

  

  

  // Add useEffect to track location changes
  useEffect(() => {
    console.log('Location changed:', { location, locationError });
  }, [location, locationError]);

  const getLocationText = () => {
    if (locationError) return "Events Around You";
    if (!location) return "Finding Your Location...";
    return "Events Near You";
  };

  const getSubtitleText = () => {
    if (locationError) return "From music festivals to tech conferences, find and join events that match your interests";
    if (!location) return "We're finding events in your area...";
    return "From music festivals to tech conferences, discover local events tailored to your location";
  };

  const handleLocationBasedSearch = async () => {
    console.log('handleLocationBasedSearch called');
    
    if (!location || !location.latitude || !location.longitude) {
      console.log('Location-based search aborted: location not available');
      const error = new Error('Location not available for search');
      onSearchError?.(error);
      return;
    }
    
    if (findEventsNearby.isPending) {
      console.log('Location-based search aborted: already pending');
      return;
    }
    
    setSearchType('location');
    
    if (onSearchStart) {
      console.log('Calling onSearchStart callback for location search');
      onSearchStart();
    }
    
    try {
      
      
      if (!findEventsNearby.mutateAsync) {
        
        const error = new Error('Location search function not available');
        onSearchError?.(error);
        return;
      }
      
      const result = await findEventsNearby.mutateAsync({
        latitude: location.latitude,
        longitude: location.longitude,
        pageNo: currentPage,
        range: searchRange
      });
      
      console.log('Location-based search result:', result);
      
      if (result?.events) {
        
        onSearchResults?.({
          ...result,
          query: `Events within ${searchRange / 1000}km`,
          searchType: 'location',
          location: {
            latitude: location.latitude,
            longitude: location.longitude
          }
        });
      } else {
        console.log('No events found in location-based response');
        onSearchResults?.({
          events: [],
          totalPages: 0,
          query: `Events within ${searchRange / 1000}km`,
          searchType: 'location'
        });
      }
      
    } catch (error) {
      console.error('Location-based search error:', error);
      onSearchError?.(error);
    }
  };

  const handleQuerySearch = async () => {
  
    
    const trimmedQuery = searchQuery.trim();
    
    if (!trimmedQuery) {
      console.log('Query search aborted: empty query');
      return;
    }
    
    if (findEvents.isPending) {
      console.log('Query search aborted: already pending');
      return;
    }
    
    setSearchType('query');
    
    if (onSearchStart) {
      console.log('Calling onSearchStart callback for query search');
      onSearchStart();
    }
    
    try {
      console.log('Executing query search...');
      
      if (!findEvents.mutateAsync) {
        console.error('findEvents.mutateAsync is not available');
        const error = new Error('Search function not available');
        onSearchError?.(error);
        return;
      }
      
      const result = await findEvents.mutateAsync(trimmedQuery);
      
      console.log('Query search result:', result);
      
      if (result?.events) {
        console.log('Calling onSearchResults with query data');
        onSearchResults?.({
          ...result,
          query: trimmedQuery,
          searchType: 'query'
        });
      } else {
        console.log('No events found in query response');
        onSearchResults?.({
          events: [],
          query: trimmedQuery,
          searchType: 'query'
        });
      }
      
    } catch (error) {
      console.error('Query search error:', error);
      onSearchError?.(error);
    }
  };

  const handleSearch = async () => {
    console.log('handleSearch called');
    
    // If there's a search query, use query-based search
    if (searchQuery.trim()) {
      await handleQuerySearch();
    } else if (location) {
      // If no query but location available, use location-based search
      await handleLocationBasedSearch();
    } else {
      console.log('Search aborted: no query and no location');
      const error = new Error('Please enter a search query or enable location access');
      onSearchError?.(error);
    }
  };

  const handleCategorySearch = async (category: string) => {
    console.log('handleCategorySearch called with category:', category);
    
    setSearchQuery(category);
    setSearchType('query');
    
    if (!findEvents.mutateAsync) {
      console.error('findEvents.mutateAsync is not available for category search');
      return;
    }
    
    try {
      const result = await findEvents.mutateAsync(category);
      
      if (result?.events) {
        onSearchResults?.({
          ...result,
          query: category,
          searchType: 'query'
        });
      }
    } catch (error) {
      console.error('Category search error:', error);
      onSearchError?.(error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    console.log('Key pressed:', e.key);
    if (e.key === 'Enter') {
      console.log('Enter key pressed, triggering search');
      handleSearch();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('Input changed:', e.target.value);
    setSearchQuery(e.target.value);
  };

  const handleButtonClick = (category: string) => {
    console.log('Category button clicked:', category);
    handleCategorySearch(category);
  };

  const handleNearbyEventsClick = () => {
    console.log('Nearby events button clicked');
    setSearchQuery(''); // Clear search query for location-based search
    handleLocationBasedSearch();
  };

  const isSearchDisabled = (!location && !locationError) || findEvents.isPending || findEventsNearby.isPending;
  const isAnySearchPending = findEvents.isPending || findEventsNearby.isPending;
  const currentError = findEvents.isError ? findEvents.error : findEventsNearby.isError ? findEventsNearby.error : null;
  const isAnySuccess = findEvents.isSuccess || findEventsNearby.isSuccess;
  const currentData = searchType === 'query' ? findEvents.data : findEventsNearby.data;

  // Add early return if hooks are not working
  if (typeof useClientLocation !== 'function' || typeof useFindEventsOnQuery !== 'function' || typeof useFindEventsNearToUser !== 'function') {
    console.error('Custom hooks are not properly imported or defined');
    return (
      <div className="bg-red-50 p-4 text-red-600">
        Error: Custom hooks are not working properly. Check imports and hook definitions.
      </div>
    );
  }

  return (
    <section className="relative bg-gradient-to-br from-yellow-400 min-h-[400px] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-black/5" />
      
      <div className="relative z-10 container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto space-y-6">
          {location && (
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-sm text-gray-700">
              <MapPin className="w-4 h-4 text-green-600" />
              <span>Location detected</span>
            </div>
          )}

          <h1 className="text-4xl md:text-6xl font-bold text-gray-800 leading-tight">
            Discover Amazing
            <span className="block text-gray-700">{getLocationText()}</span>
          </h1>
          
          <p className="text-xl text-gray-700 max-w-2xl mx-auto">
            {getSubtitleText()}
          </p>

          <div className="bg-white/90 backdrop-blur-sm rounded-lg p-6 max-w-3xl mx-auto shadow-yellow-glow border border-yellow-soft/50">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-yellow-primary w-4 h-4" />
                <Input 
                  value={searchQuery}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  placeholder={location ? "Search events or leave empty to find nearby..." : "Search events, venues, or organizers..."}
                  className="pl-10 h-12 text-base bg-white border-yellow-primary/30 focus:border-yellow-primary focus:ring-yellow-primary"
                  disabled={isAnySearchPending}
                />
              </div>
              
              <div className="flex gap-2">
                {location && (
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="h-12 px-4 bg-white hover:bg-green-50 border-green-300 text-green-700 hover:text-green-800 hover:border-green-400"
                    onClick={handleNearbyEventsClick}
                    disabled={isAnySearchPending}
                  >
                    <Navigation className="w-4 h-4 mr-2" />
                    Nearby
                  </Button>
                )}
                
                <Button variant="outline" size="lg" className="h-12 px-6 bg-white hover:bg-yellow-light/10 border-yellow-primary/30 text-yellow-primary hover:text-accent-foreground">
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                </Button>
                <Button variant="outline" size="lg" className="h-12 px-6 bg-white hover:bg-yellow-light/10 border-yellow-primary/30 text-yellow-primary hover:text-accent-foreground">
                  <Calendar className="w-4 h-4 mr-2" />
                  Dates
                </Button>
                <Button 
                  size="lg" 
                  className="h-12 px-8 bg-gradient-yellow-warm hover:shadow-yellow-warm text-gray-800 shadow-lg transition-all duration-300 font-semibold"
                  disabled={isSearchDisabled}
                  onClick={handleSearch}
                >
                  {isAnySearchPending ? "Searching..." : !location && !locationError ? "Searching..." : "Search"}
                </Button>
              </div>
            </div>

            {/* Status messages */}
            {currentError && (
              <div className="mt-4 text-sm text-red-600 bg-red-50 rounded-lg p-3 border border-red-200">
                <span>Failed to search events. Please try again.</span>
                <div className="text-xs mt-1 opacity-75">
                  Error: {String(currentError)}
                </div>
              </div>
            )}

            {isAnySuccess && currentData?.events && (
              <div className="mt-4 text-sm text-green-600 bg-green-50 rounded-lg p-3 border border-green-200">
                <span>
                  Found {currentData.events.length} events
                  {searchType === 'query' && searchQuery ? ` for "${searchQuery}"` : ''}
                  {searchType === 'location' ? ` within ${searchRange / 1000}km of your location` : ''}
                  {currentData.totalPages && currentData.totalPages > 1 ? ` (Page ${currentPage} of ${currentData.totalPages})` : ''}.
                </span>
              </div>
            )}

            {locationError && (
              <div className="mt-4 text-sm text-gray-600 bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span>Location access unavailable. Use search to find events or enable location access for nearby events.</span>
                </div>
              </div>
            )}

            {location && (
              <div className="mt-4 text-sm text-gray-600">
                <div className="flex items-center justify-center gap-2">
                  <MapPin className="w-4 h-4 text-green-600" />
                  <span>Location available - search by keyword or click "Nearby" for local events within {searchRange / 1000}km</span>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <span className="text-gray-700 font-medium">Popular {location ? "Categories" : ""}:</span>
            {['Music', 'Technology', 'Food & Drink', 'Art', 'Business'].map((category) => (
              <Button 
                key={category}
                variant="ghost" 
                size="sm"
                className="h-8 px-3 text-gray-700 hover:bg-yellow-soft/50 hover:text-gray-800 border border-yellow-primary/30 hover:border-yellow-primary/50 transition-all duration-200"
                onClick={() => handleButtonClick(category)}
                disabled={isAnySearchPending}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};