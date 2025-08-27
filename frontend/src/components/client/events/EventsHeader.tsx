import { Search, Filter, Calendar, MapPin, Navigation, ChevronDown, SortAsc } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';
import useClientLocation from '@/hooks/locationCutsomHooks';
import { useFindEventsOnQuery, useFindEventsNearToUser, useSearchEventsOnLocation } from '@/hooks/clientCustomHooks';

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
  const [searchType, setSearchType] = useState<'query' | 'location' | 'category' | 'nearby'>('query');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchRange, setSearchRange] = useState(25000);
  const [showFilters, setShowFilters] = useState(false);
  const [searchMode, setSearchMode] = useState<'text' | 'location' | 'auto'>('auto');
  
  const [locationSearchQuery, setLocationSearchQuery] = useState('');
  const [enableLocationSearch, setEnableLocationSearch] = useState(false);
  
  const findEvents = useFindEventsOnQuery();
  const findEventsNearby = useFindEventsNearToUser();
  
  const locationSearchResults = useSearchEventsOnLocation(
    locationSearchQuery,
    currentPage,
    10, 
    searchRange
  );

  const availableCategories = categories || DEFAULT_CATEGORIES;
  const quickCategories = QUICK_CATEGORIES;

  useEffect(() => {
  }, [location, locationError]);

  useEffect(() => {
    if (enableLocationSearch && locationSearchResults.data && searchType === 'location' && locationSearchQuery) {
      
      const responseData = locationSearchResults.data.data || locationSearchResults.data;
      
      onSearchResults?.({
        events: responseData.events || [],
        totalPages: responseData.totalPages || 0,
        totalCount: responseData.totalCount || 0,
        query: `Events within ${searchRange / 1000}km of ${locationSearchQuery}`,
        searchType: 'location',
        location: {
          latitude: location?.latitude,
          longitude: location?.longitude
        }
      });
      
      setEnableLocationSearch(false);
    }
  }, [locationSearchResults.data, enableLocationSearch, searchType, searchRange, location, onSearchResults, locationSearchQuery]);

  useEffect(() => {
    if (enableLocationSearch && locationSearchResults.error && searchType === 'location' && locationSearchQuery) {
      onSearchError?.(locationSearchResults.error);
      setEnableLocationSearch(false);
    }
  }, [locationSearchResults.error, enableLocationSearch, searchType, onSearchError, locationSearchQuery]);

  useEffect(() => {
    if (enableLocationSearch && locationSearchResults.isFetching && searchType === 'location' && locationSearchQuery) {
      onSearchStart?.();
    }
  }, [locationSearchResults.isFetching, enableLocationSearch, searchType, onSearchStart, locationSearchQuery]);

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
    
    if (!location || !location.latitude || !location.longitude) {
      const error = new Error('Location not available for search');
      onSearchError?.(error);
      return;
    }
    
    if (locationSearchResults.isFetching) {
      return;
    }
    
    setSearchType('location');
    
    let locQuery;
    const trimmedQuery = searchQuery.trim();
    
    if (trimmedQuery && /^[a-zA-Z\s]+$/.test(trimmedQuery)) {
      locQuery = trimmedQuery;
    } else {
      // Otherwise use coordinates
      locQuery = `${location.latitude},${location.longitude}`;
    }
    
    
    setLocationSearchQuery(locQuery);
    setEnableLocationSearch(true);
  };

  // Nearby events using useFindEventsNearToUser (mutation-based)
  const handleNearbyEventsSearch = async () => {
    
    if (!location || !location.latitude || !location.longitude) {
      const error = new Error('Location not available for nearby events search');
      onSearchError?.(error);
      return;
    }
    
    if (findEventsNearby.isPending) {
      return;
    }
    
    setSearchType('nearby');
    
    // Make sure location search is not interfering
    setLocationSearchQuery('');
    setEnableLocationSearch(false);
    
    if (onSearchStart) {
      onSearchStart();
    }
    
    try {
      if (!findEventsNearby.mutateAsync) {
        const error = new Error('Nearby events search function not available');
        onSearchError?.(error);
        return;
      }
      
      const result = await findEventsNearby.mutateAsync({
        latitude: location.latitude,
        longitude: location.longitude,
        pageNo: currentPage,
        range: searchRange
      });
      
      
      if (result?.events) {
        onSearchResults?.({
          events: result.events,
          totalPages: result.totalPages || 0,
          totalCount: result.totalCount || result.events.length,
          query: `Nearby events within ${searchRange / 1000}km`,
          searchType: 'nearby',
          location: {
            latitude: location.latitude,
            longitude: location.longitude
          }
        });
      } else {
        onSearchResults?.({
          events: [],
          totalPages: 0,
          totalCount: 0,
          query: `Nearby events within ${searchRange / 1000}km`,
          searchType: 'nearby'
        });
      }
      
    } catch (error) {
      onSearchError?.(error);
    }
  };

  const handleQuerySearch = async () => {
    const trimmedQuery = searchQuery.trim();
    
    if (!trimmedQuery) {
      return;
    }
    
    if (findEvents.isPending) {
      return;
    }
    
    setSearchType('query');
    
    if (onSearchStart) {
      onSearchStart();
    }
    
    try {
      
      if (!findEvents.mutateAsync) {
        const error = new Error('Search function not available');
        onSearchError?.(error);
        return;
      }
      
      const result = await findEvents.mutateAsync(trimmedQuery);
      
      
      if (result?.events) {
        onSearchResults?.({
          ...result,
          query: trimmedQuery,
          searchType: 'query'
        });
      } else {
        onSearchResults?.({
          events: [],
          query: trimmedQuery,
          searchType: 'query'
        });
      }
      
    } catch (error) {
      onSearchError?.(error);
    }
  };

  const handleCategorySearch = async (category: string = selectedCategory, sortBy: string = selectedSort) => {
    
    if (category === 'All Categories') {
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
      onSearchStart();
    }
    
    onSearchResults?.({
      events: [], 
      totalPages: 1,
      query: `${category} events (${sortOptions.find(opt => opt.value === sortBy)?.label})`,
      searchType: 'category',
      category: category,
      sortBy: sortBy
    });
  };

  const isLikelyPlaceName = (query: string): boolean => {
    const trimmed = query.trim();
    
    const hasOnlyValidChars = /^[a-zA-Z\s,.-]+$/.test(trimmed);
    const hasReasonableLength = trimmed.length >= 3 && trimmed.length <= 50;
    const hasNoSpecialSearchTerms = !/^(event|concert|workshop|seminar|conference|music|entertainment)/i.test(trimmed);
    
    
    const indianPlacePatterns = [
      /kuda$/i,  // ends with 'kuda' (like Irinjalakuda)
      /pur$/i,   // ends with 'pur'
      /bad$/i,   // ends with 'bad'
      /nagar$/i, // ends with 'nagar'
      /kochi|ernakulam|thrissur|calicut|trivandrum|kottayam|palakkad/i 
    ];
    
    const matchesIndianPattern = indianPlacePatterns.some(pattern => pattern.test(trimmed));
    
    return hasOnlyValidChars && hasReasonableLength && (hasNoSpecialSearchTerms || matchesIndianPattern);
  };

  const handleSearch = async () => {
    
    const trimmedQuery = searchQuery.trim();
    
    if (trimmedQuery) {
      if (searchMode === 'text') {
        await handleQuerySearch();
      } else if (searchMode === 'location') {
        if (location) {
          await handleLocationBasedSearch();
        } else {
          const error = new Error('Location not available for location search');
          onSearchError?.(error);
        }
      } else {
        // Auto mode - smart detection
        const isPlaceName = isLikelyPlaceName(trimmedQuery);
        
        if (isPlaceName && location) {
          await handleLocationBasedSearch();
        } else {
          await handleQuerySearch();
        }
      }
    } else if (selectedCategory !== 'All Categories') {
      await handleCategorySearch();
    } else if (location) {
      await handleLocationBasedSearch();
    } else {
      const error = new Error('Please enter a search query, select a category, or enable location access');
      onSearchError?.(error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  const handleSortChange = (sortBy: string) => {
    setSelectedSort(sortBy);
  };

  const handleApplyFilters = () => {
    if (selectedCategory !== 'All Categories') {
      handleCategorySearch(selectedCategory, selectedSort);
    } else {
      handleSearch();
    }
    setShowFilters(false);
  };

  const handleNearbyEventsClick = () => {
    setSearchQuery('');
    setSelectedCategory('All Categories');
    setLocationSearchQuery('');
    setEnableLocationSearch(false);
    handleNearbyEventsSearch(); // This uses useFindEventsNearToUser only
  };

  const handleQuickCategoryClick = (category: string) => {
    setSelectedCategory(category);
    setSearchQuery(''); // Clear search query when selecting category
    handleCategorySearch(category, selectedSort);
  };

  const isSearchDisabled = (!location && !locationError) || findEvents.isPending || findEventsNearby.isPending || locationSearchResults.isFetching;
  const isAnySearchPending = findEvents.isPending || findEventsNearby.isPending || locationSearchResults.isFetching;

  return (
    <section className="relative bg-gradient-to-br from-yellow-400 min-h-[500px] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-black/5" />
      
      <div className="relative z-10 container mx-auto px-4 text-center">
        <div className="max-w-5xl mx-auto space-y-8">
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

          {/* Enhanced Search Container */}
          <div className="bg-white/98 backdrop-blur-sm rounded-3xl p-8 max-w-6xl mx-auto shadow-2xl border-4 border-yellow-soft/60 shadow-yellow-glow">
            {/* Main Search Row */}
            <div className="flex flex-col xl:flex-row gap-6 items-stretch">
              {/* Refined Search Input */}
              <div className="flex-1 relative">
                <div className="relative">
                  <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-yellow-primary w-6 h-6 z-10" />
                  <Input 
                    value={searchQuery}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    placeholder={
                      searchMode === 'text' ? "Search events, artists, keywords..." :
                      searchMode === 'location' ? "Enter location name..." :
                      "Search events or enter location..."
                    }
                    className="pl-16 pr-6 h-16 text-lg font-medium bg-white border-3 border-yellow-primary/50 focus:border-yellow-primary focus:ring-3 focus:ring-yellow-primary/30 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl placeholder:text-gray-400"
                    disabled={isAnySearchPending}
                  />
                  {/* Refined Search type indicator */}
                  {searchQuery.trim() && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      {searchMode === 'text' ? (
                        <div className="flex items-center gap-1.5 text-xs bg-blue-100 text-blue-700 px-2.5 py-1.5 rounded-lg font-medium shadow-sm">
                          <Search className="w-3 h-3" />
                          <span>Text</span>
                        </div>
                      ) : searchMode === 'location' ? (
                        <div className="flex items-center gap-1.5 text-xs bg-green-100 text-green-700 px-2.5 py-1.5 rounded-lg font-medium shadow-sm">
                          <MapPin className="w-3 h-3" />
                          <span>Location</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-xs bg-purple-100 text-purple-700 px-2.5 py-1.5 rounded-lg font-medium shadow-sm">
                          {isLikelyPlaceName(searchQuery.trim()) && location ? (
                            <>
                              <MapPin className="w-3 h-3" />
                              <span>Auto: Location</span>
                            </>
                          ) : (
                            <>
                              <Search className="w-3 h-3" />
                              <span>Auto: Text</span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Refined Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 lg:gap-4">
                {/* Refined Search Mode Toggle */}
                <div className="flex bg-gray-100 rounded-lg p-1 shadow-inner">
                  <Button
                    variant={searchMode === 'text' ? 'default' : 'ghost'}
                    size="sm"
                    className={`h-8 px-3 text-xs font-medium transition-all duration-200 ${
                      searchMode === 'text' 
                        ? 'bg-blue-500 text-white shadow-md hover:bg-blue-600' 
                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-200'
                    }`}
                    onClick={() => setSearchMode('text')}
                  >
                    <Search className="w-3 h-3 mr-1" />
                    Text
                  </Button>
                  <Button
                    variant={searchMode === 'location' ? 'default' : 'ghost'}
                    size="sm" 
                    className={`h-8 px-3 text-xs font-medium transition-all duration-200 ${
                      searchMode === 'location' 
                        ? 'bg-green-500 text-white shadow-md hover:bg-green-600' 
                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-200'
                    }`}
                    onClick={() => setSearchMode('location')}
                    disabled={!location}
                  >
                    <MapPin className="w-3 h-3 mr-1" />
                    Location
                  </Button>
                  <Button
                    variant={searchMode === 'auto' ? 'default' : 'ghost'}
                    size="sm"
                    className={`h-8 px-3 text-xs font-medium transition-all duration-200 ${
                      searchMode === 'auto' 
                        ? 'bg-purple-500 text-white shadow-md hover:bg-purple-600' 
                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-200'
                    }`}
                    onClick={() => setSearchMode('auto')}
                  >
                    <Filter className="w-3 h-3 mr-1" />
                    Auto
                  </Button>
                </div>

                {/* Refined Nearby Button */}
                {location && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-10 px-4 bg-white hover:bg-green-50 border-2 border-green-300 text-green-700 hover:text-green-800 hover:border-green-400 font-medium shadow-md hover:shadow-lg transition-all duration-300 text-sm"
                    onClick={handleNearbyEventsClick}
                    disabled={isAnySearchPending}
                  >
                    <Navigation className="w-4 h-4 mr-1.5" />
                    Nearby
                  </Button>
                )}
                
                {/* Refined Filters Button */}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-10 px-4 bg-white hover:bg-yellow-light/10 border-2 border-yellow-primary/40 text-yellow-primary hover:text-accent-foreground font-medium shadow-md hover:shadow-lg transition-all duration-300 text-sm"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="w-4 h-4 mr-1.5" />
                  Filters
                  <ChevronDown className={`w-3 h-3 ml-1 transition-transform duration-300 ${showFilters ? 'rotate-180' : ''}`} />
                </Button>

                {/* Refined Main Search Button */}
                <Button 
                  size="default" 
                  className="h-10 px-6 bg-gradient-yellow-warm hover:shadow-yellow-warm text-gray-800 shadow-xl transition-all duration-300 font-bold text-sm hover:scale-105"
                  disabled={isSearchDisabled}
                  onClick={handleSearch}
                >
                  {isAnySearchPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-800 mr-1.5"></div>
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-1.5" />
                      {!location && !locationError ? "Searching..." : "Search"}
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Enhanced Filters Panel */}
            {showFilters && (
              <div className="mt-6 p-5 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border-2 border-gray-200 shadow-inner">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Enhanced Category Filter */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Event Category
                    </label>
                    <div className="relative">
                      <select
                        value={selectedCategory}
                        onChange={(e) => handleCategoryChange(e.target.value)}
                        className="w-full h-10 px-3 bg-white border-2 border-gray-300 rounded-lg focus:border-yellow-primary focus:ring-2 focus:ring-yellow-primary/30 appearance-none cursor-pointer font-medium shadow-sm hover:shadow-md transition-all duration-200 text-sm"
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

                  {/* Enhanced Sort Filter */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Sort Events By
                    </label>
                    <div className="relative">
                      <select
                        value={selectedSort}
                        onChange={(e) => handleSortChange(e.target.value)}
                        className="w-full h-10 px-3 bg-white border-2 border-gray-300 rounded-lg focus:border-yellow-primary focus:ring-2 focus:ring-yellow-primary/30 appearance-none cursor-pointer font-medium shadow-sm hover:shadow-md transition-all duration-200 text-sm"
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

                {/* Enhanced Search Range Slider */}
                {location && (
                  <div className="mt-5">
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Search Range: <span className="text-yellow-600 font-black text-base">{searchRange / 1000}km</span>
                    </label>
                    <input
                      type="range"
                      min="5000"
                      max="100000"
                      step="5000"
                      value={searchRange}
                      onChange={(e) => setSearchRange(parseInt(e.target.value))}
                      className="w-full h-2 bg-gradient-to-r from-yellow-200 to-yellow-400 rounded-lg appearance-none cursor-pointer shadow-inner"
                      style={{
                        background: `linear-gradient(to right, #fef3c7 0%, #fbbf24 ${((searchRange - 5000) / (100000 - 5000)) * 100}%, #e5e7eb ${((searchRange - 5000) / (100000 - 5000)) * 100}%, #e5e7eb 100%)`
                      }}
                    />
                    <div className="flex justify-between text-xs text-gray-600 font-medium mt-1">
                      <span>5km</span>
                      <span>100km</span>
                    </div>
                  </div>
                )}

                {/* Refined Filter Action Buttons */}
                <div className="flex justify-between mt-5">
                  <Button
                    variant="outline"
                    size="sm"
                    className="px-4 h-9 border-2 hover:bg-gray-50 font-medium text-sm"
                    onClick={() => {
                      setSelectedCategory('All Categories');
                      setSelectedSort('newest');
                      setSearchRange(25000);
                    }}
                  >
                    Clear All
                  </Button>
                  <Button
                    onClick={handleApplyFilters}
                    disabled={isAnySearchPending}
                    size="sm"
                    className="px-6 h-9 bg-yellow-primary hover:bg-yellow-primary/90 text-gray-800 font-bold shadow-lg hover:shadow-xl transition-all duration-300 text-sm"
                  >
                    <SortAsc className="w-4 h-4 mr-1.5" />
                    Apply Filters
                  </Button>
                </div>
              </div>
            )}

            {/* Refined Status indicators */}
            {(selectedCategory !== 'All Categories' || selectedSort !== 'newest') && (
              <div className="mt-5 text-sm text-blue-600 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-3 border-2 border-blue-200 shadow-sm">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  <span className="font-medium">
                    Active Filters: 
                    {selectedCategory !== 'All Categories' && ` Category: ${selectedCategory}`}
                    {selectedSort !== 'newest' && ` • Sort: ${sortOptions.find(opt => opt.value === selectedSort)?.label}`}
                  </span>
                </div>
              </div>
            )}

            {/* Refined Current search mode indicator */}
            <div className="mt-5 text-center">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-gray-50 to-gray-100 rounded-full px-4 py-2 border border-gray-200 shadow-sm">
                <span className="text-gray-700 font-medium text-sm">Search Mode:</span>
                {searchMode === 'text' && (
                  <span className="flex items-center gap-1.5 text-blue-600 font-bold text-sm">
                    <Search className="w-3 h-3" />
                    Text Search
                  </span>
                )}
                {searchMode === 'location' && (
                  <span className="flex items-center gap-1.5 text-green-600 font-bold text-sm">
                    <MapPin className="w-3 h-3" />
                    Location Search
                  </span>
                )}
                {searchMode === 'auto' && (
                  <span className="flex items-center gap-1.5 text-purple-600 font-bold text-sm">
                    <Filter className="w-3 h-3" />
                    Auto Detection
                    {searchQuery.trim() && (
                      <span className="text-xs text-gray-500 bg-white px-2 py-0.5 rounded-md border ml-1">
                        → {isLikelyPlaceName(searchQuery.trim()) && location ? 'Location' : 'Text'}
                      </span>
                    )}
                  </span>
                )}
              </div>
            </div>

            {/* Refined Error/Info Messages */}
            {locationError && (
              <div className="mt-5 text-sm text-amber-700 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl p-3 border-2 border-amber-200 shadow-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-amber-600" />
                  <span className="font-medium">Location access unavailable. Use search or filters to find events.</span>
                </div>
              </div>
            )}

            {location && (
              <div className="mt-5 text-sm text-green-700 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-3 border-2 border-green-200 shadow-sm">
                <div className="flex items-center justify-center gap-2">
                  <MapPin className="w-4 h-4 text-green-600" />
                  <span className="font-medium">Location detected - search by keyword, filter by category, or click "Nearby" for local events</span>
                </div>
              </div>
            )}
          </div>

          {/* Refined Quick Categories */}
          <div className="flex flex-wrap justify-center gap-3">
            <span className="text-gray-700 font-bold text-lg mb-2 w-full text-center">Quick Categories:</span>
            <div className="flex flex-wrap justify-center gap-2">
              {quickCategories.map((category) => (
                <Button 
                  key={category}
                  variant="ghost" 
                  size="sm"
                  className="h-9 px-4 text-gray-700 hover:bg-yellow-soft/50 hover:text-gray-800 border-2 border-yellow-primary/40 hover:border-yellow-primary/70 transition-all duration-300 font-medium shadow-md hover:shadow-lg hover:scale-105 bg-white/80 backdrop-blur-sm text-sm"
                  onClick={() => handleQuickCategoryClick(category)}
                  disabled={isAnySearchPending}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};