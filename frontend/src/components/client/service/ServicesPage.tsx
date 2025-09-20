import React, { useState } from 'react';
import { useFindServiceForclient, useFindServiceOnCategoryBasis, useFindServiceUsingSearch, useFindCategoryClient } from '../../../hooks/clientCustomHooks';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

// Define interfaces for type safety
interface Service {
  _id: string;
  serviceTitle: string;
  serviceDescription: string;
  categoryId: string;
  servicePrice: number;
  additionalHourFee: number;
  serviceDuration: string;
  cancellationPolicy: string;
  termsAndCondition: string;
  vendorId: string;
  yearsOfExperience: number;
  status: string;
}

interface Category {
  _id: string;
  title: string;
}

interface ServiceResponse {
  message: string;
  Services: Service[];
  totalPages: number;
}

interface SearchResponse {
  message: string;
  searchedService: Partial<Service>[];
}

const ServicesPage: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('serviceTitle');
  const navigate=useNavigate()

  // Fetch categories
  const { data: categoriesData, isLoading: isLoadingCategories, error: categoriesError } = useFindCategoryClient();
  

  // Fallback categories if data is unavailable
  const categories: Category[] = Array.isArray(categoriesData)
    ? [{ _id: '', title: 'All Categories' }, ...categoriesData]
    : [
        { _id: '', title: 'All Categories' },
        { _id: '68a292cd91addda1447401d1', title: 'Music' },
        { _id: '68a301cde4bf15246bea862c', title: 'Workshop' },
        { _id: '68a30de7e4bf15246bea863c', title: 'Entertainment' },
        { _id: '68a32245e4bf15246bea8647', title: 'Seminar' },
        { _id: '68bece0bb0b6943f68a73062', title: 'Wedding' },
      ];

  // Fetch all services
  const { data: allServicesData, isLoading: isLoadingAll } = useFindServiceForclient(currentPage);
  console.log(allServicesData)

  // Fetch services by category
  const { data: categoryServicesData, isLoading: isLoadingCategory, error: categoryError } = useFindServiceOnCategoryBasis(
    selectedCategory,
    currentPage,
    sortBy,
    { enabled: !!selectedCategory }
  );
  

  // Search mutation
  const { mutate: searchServices, data: searchResultsData, isPending: isSearching } = useFindServiceUsingSearch();
  
  

  // Handle search input change
  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Handle search button click
  const handleSearch = () => {
    if (searchQuery.length > 0) {
      searchServices(searchQuery);
      setSelectedCategory(''); // Reset category filter when searching
    }
  };
  const handleViewDetails = (serviceId: string, vendorId: string) => {
    navigate(`/services/${serviceId}/${vendorId}`);
  };

  // Extract services from response objects, default to empty array if undefined
  const allServices = allServicesData?.Services || [];
  const categoryServices = categoryServicesData?.Services || [];
  const searchResultsPartial = searchResultsData?.searchedService || [];

  // Map partial search results to full service data
  const searchResults: Service[] = searchResultsPartial
    .map((partialService) => {
      const fullService =
        (selectedCategory ? categoryServices : allServices).find(
          (service) => service._id === partialService._id
        );
      return fullService;
    })
    .filter((service): service is Service => !!service);

  // Determine which services to display
  const displayedServices = searchResults.length > 0 ? searchResults : (selectedCategory ? categoryServices : allServices);

  // Get category title for display
  const getCategoryName = (categoryId: string) => {
    const category = categories.find((cat) => cat._id === categoryId);
    return category?.title || 'Unknown';
  };

  return (
    <div className="min-h-screen bg-yellow-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <h1 className="text-3xl font-bold text-yellow-800 mb-8">Vendor Services</h1>

        {/* Search and Filter Section */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 items-center">
          {/* Search Input and Button */}
          <div className="flex-1 w-full md:w-auto flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchInput}
              placeholder="Search services..."
              className="flex-1 p-3 rounded-lg border border-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white text-yellow-800"
            />
            <button
              onClick={handleSearch}
              disabled={searchQuery.length === 0 || isSearching}
              className="px-4 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:bg-yellow-300 transition-colors"
            >
              Search
            </button>
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setCurrentPage(1); // Reset to page 1 when category changes
              setSearchQuery(''); // Reset search query when category changes
            }}
            className="w-full md:w-48 p-3 rounded-lg border border-yellow-300 bg-white text-yellow-800 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            disabled={isLoadingCategories || !!categoriesError}
          >
            {isLoadingCategories ? (
              <option value="">Loading categories...</option>
            ) : categoriesError ? (
              <option value="">Error loading categories</option>
            ) : (
              <>
                <option value="" disabled>
                  Select a Category
                </option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.title}
                  </option>
                ))}
              </>
            )}
          </select>

          
          
        </div>

        {/* Error State */}
        {categoriesError && (
          <div className="text-center text-red-600 mb-4">
            Failed to load categories. Please try again.
          </div>
        )}
        {categoryError && selectedCategory && (
          <div className="text-center text-red-600 mb-4">
            Failed to load services for selected category. Please try another category.
          </div>
        )}

        {/* Loading State */}
        {(isLoadingAll || isLoadingCategory || isSearching || isLoadingCategories) && (
          <div className="text-center text-yellow-800">Loading...</div>
        )}

        {/* No Services Message */}
        {displayedServices.length === 0 &&
          !isLoadingAll &&
          !isLoadingCategory &&
          !isSearching &&
          !isLoadingCategories && (
            <div className="text-center text-yellow-800">No services found.</div>
          )}

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedServices.map((service: Service) => (
            <div
              key={service._id}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-yellow-200"
            >
              <h2 className="text-xl font-semibold text-yellow-800 mb-2">{service.serviceTitle}</h2>
              <p className="text-yellow-600 mb-2">Category: {getCategoryName(service.categoryId)}</p>
              <p className="text-gray-600 mb-2 line-clamp-3">Description: {service.serviceDescription}</p>
              <p className="text-yellow-700 font-bold mb-2">Price: ₹{service.servicePrice}</p>
              <p className="text-gray-500 text-sm mb-2">Duration: {service.serviceDuration}</p>
              <p className="text-gray-500 text-sm mb-2">Additional Hour: ₹{service.additionalHourFee}</p>
              <p className="text-gray-500 text-sm mb-2">Cancellation Policy: {service.cancellationPolicy}</p>
              <p className="text-gray-500 text-sm mb-2 line-clamp-2">Terms: {service.termsAndCondition}</p>
              <p className="text-gray-500 text-sm mb-4">Experience: {service.yearsOfExperience} years</p>
              <button className="mt-4 w-full bg-yellow-500 text-white py-2 rounded-lg hover:bg-yellow-600 transition-colors"
              onClick={() => handleViewDetails(service._id, service.vendorId)}>
                View Details
              </button>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="mt-8 flex justify-center gap-4">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-yellow-500 text-white rounded-lg disabled:bg-yellow-300 hover:bg-yellow-600"
          >
            Previous
          </button>
          <span className="text-yellow-800 font-semibold">Page {currentPage}</span>
          <button
            onClick={() => setCurrentPage((prev) => prev + 1)}
            disabled={currentPage >= (allServicesData?.totalPages || categoryServicesData?.totalPages || 1)}
            className="px-4 py-2 bg-yellow-500 text-white rounded-lg disabled:bg-yellow-300 hover:bg-yellow-600"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServicesPage;