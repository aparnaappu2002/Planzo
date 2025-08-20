import { Search, Filter, Calendar, MapPin, Navigation, ChevronDown, SortAsc } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';
import useClientLocation from '@/hooks/locationCutsomHooks';
import { useFindEventsOnQuery, useFindEventsNearToUser, useFindEventsBasedOnCategory } from '@/hooks/clientCustomHooks';

interface EventsHeroProps {
  onSearchResults?: (results: any) => void;
  onSearchStart?: () => void;
  onSearchError?: (error: any) => void;
  categories?: string[];
}

const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'a-z', label: 'Title A-Z' },
  { value: 'z-a', label: 'Title Z-A' },
  { value: 'price-low-high', label: 'Price: Low to High' },
  { value: 'price-high-low', label: 'Price: High to Low' }
];

// Default hardcoded categories
const DEFAULT_CATEGORIES = [
  'All Categories',
  'Music',
  'Entertainment', 
  'Workshop',
  'Seminar',
  'Conference',
  
];

const QUICK_CATEGORIES = ['Music', 'Entertainment', 'Workshop', 'Seminar', 'Technology'];

export const EventsHero = ({ onSearchResults, onSearchStart, onSearchError, categories }: EventsHeroProps) => {
  const { location, error: locationError } = useClientLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedSort, setSelectedSort] = useState('newest');
  const [searchType, setSearchType] = useState<'query' | 'location' | 'category'>('query');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchRange, setSearchRange] = useState(25000);
  const [showFilters, setShowFilters] = useState(false);
  
  const findEvents = useFindEventsOnQuery();
  const findEventsNearby = useFindEventsNearToUser();

  // Use provided categories or fall back to defaults
  const availableCategories = categories || DEFAULT_CATEGORIES;
  const quickCategories = QUICK_CATEGORIES;

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

  // Fixed: Proper category search implementation
  const handleCategorySearch = async (category: string = selectedCategory, sortBy: string = selectedSort) => {
    console.log('handleCategorySearch called with category:', category, 'sortBy:', sortBy);
    
    if (category === 'All Categories') {
      // If "All Categories" is selected, fall back to regular search or location search
      if (searchQuery.trim()) {
        await handleQuerySearch();
      } else if (location) {
        await handleLocationBasedSearch();
      } else {
        const error = new Error('Please select a specific category or enter a search query');
        onSearchError?.(error);
      }
      return;
    }
    
    setSearchType('category');
    
    if (onSearchStart) {
      console.log('Calling onSearchStart callback for category search');
      onSearchStart();
    }
    
    // Instead of trying to create a new hook instance, just send the search parameters
    // to the parent component which will handle the actual API call
    onSearchResults?.({
      events: [], // Empty initially, will be populated by parent component
      totalPages: 1,
      query: `${category} events (${sortOptions.find(opt => opt.value === sortBy)?.label})`,
      searchType: 'category',
      category: category,
      sortBy: sortBy
    });
  };

  const handleSearch = async () => {
    console.log('handleSearch called');
    
    // Priority: 1. Search query, 2. Category filter, 3. Location
    if (searchQuery.trim()) {
      await handleQuerySearch();
    } else if (selectedCategory !== 'All Categories') {
      await handleCategorySearch();
    } else if (location) {
      await handleLocationBasedSearch();
    } else {
      console.log('Search aborted: no query, category, or location');
      const error = new Error('Please enter a search query, select a category, or enable location access');
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

  const handleCategoryChange = (category: string) => {
    console.log('Category changed:', category);
    setSelectedCategory(category);
  };

  const handleSortChange = (sortBy: string) => {
    console.log('Sort changed:', sortBy);
    setSelectedSort(sortBy);
  };

  const handleApplyFilters = () => {
    console.log('Applying filters:', { selectedCategory, selectedSort });
    if (selectedCategory !== 'All Categories') {
      handleCategorySearch(selectedCategory, selectedSort);
    } else {
      handleSearch();
    }
    setShowFilters(false);
  };

  const handleNearbyEventsClick = () => {
    console.log('Nearby events button clicked');
    setSearchQuery('');
    setSelectedCategory('All Categories');
    handleLocationBasedSearch();
  };

  const handleQuickCategoryClick = (category: string) => {
    console.log('Quick category clicked:', category);
    setSelectedCategory(category);
    setSearchQuery(''); // Clear search query when selecting category
    handleCategorySearch(category, selectedSort);
  };

  const isSearchDisabled = (!location && !locationError) || findEvents.isPending || findEventsNearby.isPending;
  const isAnySearchPending = findEvents.isPending || findEventsNearby.isPending;

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
                  placeholder={location ? "Search events or use filters below..." : "Search events, venues, or organizers..."}
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
                
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="h-12 px-6 bg-white hover:bg-yellow-light/10 border-yellow-primary/30 text-yellow-primary hover:text-accent-foreground"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                  <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
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

            {/* Filters Panel */}
            {showFilters && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Category Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <div className="relative">
                      <select
                        value={selectedCategory}
                        onChange={(e) => handleCategoryChange(e.target.value)}
                        className="w-full h-10 px-3 bg-white border border-gray-300 rounded-md focus:border-yellow-primary focus:ring-1 focus:ring-yellow-primary appearance-none cursor-pointer"
                      >
                        {availableCategories.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Sort Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sort By
                    </label>
                    <div className="relative">
                      <select
                        value={selectedSort}
                        onChange={(e) => handleSortChange(e.target.value)}
                        className="w-full h-10 px-3 bg-white border border-gray-300 rounded-md focus:border-yellow-primary focus:ring-1 focus:ring-yellow-primary appearance-none cursor-pointer"
                      >
                        {sortOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="flex justify-between mt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedCategory('All Categories');
                      setSelectedSort('newest');
                    }}
                  >
                    Clear Filters
                  </Button>
                  <Button
                    onClick={handleApplyFilters}
                    disabled={isAnySearchPending}
                    className="bg-yellow-primary hover:bg-yellow-primary/90 text-gray-800"
                  >
                    <SortAsc className="w-4 h-4 mr-2" />
                    Apply Filters
                  </Button>
                </div>
              </div>
            )}

            {/* Status indicator */}
            {(selectedCategory !== 'All Categories' || selectedSort !== 'newest') && (
              <div className="mt-4 text-sm text-blue-600 bg-blue-50 rounded-lg p-3 border border-blue-200">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  <span>
                    Filters active: 
                    {selectedCategory !== 'All Categories' && ` Category: ${selectedCategory}`}
                    {selectedSort !== 'newest' && ` • Sort: ${sortOptions.find(opt => opt.value === selectedSort)?.label}`}
                  </span>
                </div>
              </div>
            )}

            {locationError && (
              <div className="mt-4 text-sm text-gray-600 bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span>Location access unavailable. Use search or filters to find events.</span>
                </div>
              </div>
            )}

            {location && (
              <div className="mt-4 text-sm text-gray-600">
                <div className="flex items-center justify-center gap-2">
                  <MapPin className="w-4 h-4 text-green-600" />
                  <span>Location available - search by keyword, filter by category, or click "Nearby" for local events</span>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <span className="text-gray-700 font-medium">Quick Categories:</span>
            {quickCategories.map((category) => (
              <Button 
                key={category}
                variant="ghost" 
                size="sm"
                className="h-8 px-3 text-gray-700 hover:bg-yellow-soft/50 hover:text-gray-800 border border-yellow-primary/30 hover:border-yellow-primary/50 transition-all duration-200"
                onClick={() => handleQuickCategoryClick(category)}
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