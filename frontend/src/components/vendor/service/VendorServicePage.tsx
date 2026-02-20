import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useQueryClient } from '@tanstack/react-query';
import { RootState } from '@/redux/Store';
import { 
  useFetchCategoryForServiceQuery, 
  useCreateServiceMutation, 
  useFetchServiceVendor, 
  useEditServiceVendor, 
  useChangeStatusServiceVendor,
  useSearchServiceVendor 
} from '@/hooks/vendorCustomHooks';
import { useDebounce } from '@/hooks/useDebounce';
import { toast } from 'react-toastify';

interface Service {
  _id?: string;
  serviceTitle: string;
  yearsOfExperience: number;
  serviceDescription: string;
  cancellationPolicy: string;
  termsAndCondition: string;
  serviceDuration: string;
  servicePrice: number;
  additionalHourFee: number;
  status: string;
  vendorId?: string;
  categoryId: string;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

interface Category {
  _id: string;
  title: string;
}

const VendorServicesPage: React.FC = () => {
  const vendorId = useSelector((state: RootState) => state.vendorSlice.vendor?._id);
  const [pageNo, setPageNo] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);
  const [confirmServiceId, setConfirmServiceId] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<'activate' | 'deactivate' | null>(null);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const { data: servicesData, isLoading: isLoadingServices, error: servicesError } = useFetchServiceVendor({ vendorId: vendorId ?? '', pageNo });
  
  const { data: searchData, isLoading: isLoadingSearch, error: searchError } = useSearchServiceVendor({
    vendorId: vendorId ?? '',
    searchTerm: debouncedSearchTerm,
    pageNo
  });

  const { data: categoriesData, isLoading: isLoadingCategories, error: categoriesError } = useFetchCategoryForServiceQuery();
  const createServiceMutation = useCreateServiceMutation();
  const editServiceMutation = useEditServiceVendor();
  const changeStatusMutation = useChangeStatusServiceVendor();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<Service>({
    serviceTitle: '',
    yearsOfExperience: 0,
    serviceDescription: '',
    cancellationPolicy: '',
    termsAndCondition: '',
    serviceDuration: '',
    servicePrice: 0,
    additionalHourFee: 0,
    status: 'active',
    categoryId: '',
  });

  const isSearching = debouncedSearchTerm.trim().length > 0;
  const currentData = isSearching ? searchData : servicesData;
  const currentLoading = isSearching ? isLoadingSearch : isLoadingServices;
  const currentError = isSearching ? searchError : servicesError;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPageNo(1);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setPageNo(1);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'yearsOfExperience' || name === 'servicePrice' || name === 'additionalHourFee' ? Number(value) : value,
    }));
    setErrorMessage(null);
    setFieldErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const openModal = (service?: Service) => {
    if (service) {
      setEditingService(service);
      setFormData(service);
    } else {
      setEditingService(null);
      setFormData({
        serviceTitle: '',
        yearsOfExperience: 0,
        serviceDescription: '',
        cancellationPolicy: '',
        termsAndCondition: '',
        serviceDuration: '',
        servicePrice: 0,
        additionalHourFee: 0,
        status: 'active',
        categoryId: '',
      });
    }
    setErrorMessage(null);
    setFieldErrors({});
    setIsModalOpen(true);
  };

  const validateForm = (data: Service): Record<string, string> => {
    const errors: Record<string, string> = {};
    if (!data.serviceTitle.trim()) errors.serviceTitle = 'Service Title is required';
    if (data.yearsOfExperience < 0) errors.yearsOfExperience = 'Years of Experience must be non-negative';
    if (!data.serviceDescription.trim()) errors.serviceDescription = 'Service Description is required';
    if (!data.cancellationPolicy.trim()) errors.cancellationPolicy = 'Cancellation Policy is required';
    if (!data.termsAndCondition.trim()) errors.termsAndCondition = 'Terms and Conditions are required';
    if (!data.serviceDuration.trim()) errors.serviceDuration = 'Service Duration is required';
    if (data.servicePrice <= 0) errors.servicePrice = 'Service Price must be a positive number';
    if (data.additionalHourFee <= 0) errors.additionalHourFee = 'Additional Hour Fee must be a positive number';
    if (!data.categoryId) errors.categoryId = 'Please select a category';
    if (!['active', 'blocked'].includes(data.status)) errors.status = 'Status must be either "active" or "blocked"';
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorId) {
      toast.error('Vendor ID is missing');
      return;
    }

    const validationErrors = validateForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      toast.error('Please fix the errors in the form');
      return;
    }

    try {
      if (editingService) {
        await editServiceMutation.mutateAsync({ service: { ...formData, vendorId }, serviceId: editingService._id! });
        toast.success('Service updated successfully');
      } else {
        await createServiceMutation.mutateAsync({ ...formData, vendorId });
        toast.success('Service created successfully');
      }
      
      await queryClient.invalidateQueries({ queryKey: ['services', vendorId] });
      await queryClient.invalidateQueries({ queryKey: ['services', 'search', vendorId] });

      setIsModalOpen(false);
      setFormData({
        serviceTitle: '',
        yearsOfExperience: 0,
        serviceDescription: '',
        cancellationPolicy: '',
        termsAndCondition: '',
        serviceDuration: '',
        servicePrice: 0,
        additionalHourFee: 0,
        status: 'active',
        categoryId: '',
      });
      setErrorMessage(null);
      setFieldErrors({});
    } catch (err: any) {
      console.error('Error saving service:', err);
      if (err.errors) {
        const newFieldErrors: Record<string, string> = {};
        Object.entries(err.errors).forEach(([key, error]: [string, any]) => {
          newFieldErrors[key] = error.message || 'Invalid input';
        });
        setFieldErrors(newFieldErrors);
        toast.error('Failed to save service. Please check your input.');
      } else {
        toast.error(err.message || 'Failed to save service. Please try again.');
      }
    }
  };

  const openConfirmModal = (serviceId: string, action: 'activate' | 'deactivate') => {
    setConfirmServiceId(serviceId);
    setConfirmAction(action);
    setIsConfirmModalOpen(true);
  };

  const handleStatusChange = async () => {
  if (!confirmServiceId) return;

  try {
    await changeStatusMutation.mutateAsync(confirmServiceId);
    
    await queryClient.invalidateQueries({ 
      queryKey: ['services-in-vendor', vendorId],
      exact: false 
    });
    
    await queryClient.invalidateQueries({ 
      queryKey: ['services-search-vendor', vendorId], 
      exact: false 
    });
    
    toast.success('Service status updated successfully');
  } catch (err) {
    console.error('Error changing service status:', err);
    toast.error('Failed to update service status');
  } finally {
    setIsConfirmModalOpen(false);
    setConfirmServiceId(null);
    setConfirmAction(null);
  }
};

  const services: Service[] = currentData?.Services || [];
  const totalPages: number = currentData?.totalPages || 1;
  const categories: Category[] = categoriesData?.categories || [];

  const renderContent = () => {
    if (currentData === undefined) {
      return (
        <div className="flex justify-center items-center py-4">
          <div className="text-yellow-600 text-xl animate-pulse">Loading...</div>
        </div>
      );
    }

    if (currentLoading) {
      return (
        <div className="flex justify-center items-center py-4">
          <div className="text-yellow-600 text-xl animate-pulse">Loading...</div>
        </div>
      );
    }

    if (currentError) {
      return (
        <div className="flex justify-center items-center py-4">
          <div className="text-red-600 text-xl">Error: {currentError.message || 'Failed to load services'}</div>
        </div>
      );
    }

    if (services.length === 0) {
      return (
        <p className="text-gray-600 text-center py-4">
          {isSearching ? `No services found matching "${searchTerm}"` : 'No services available.'}
        </p>
      );
    }

    return (
      <div className="bg-white rounded-lg shadow-md border-2 border-yellow-400 overflow-x-auto">
        <table className="w-full text-left table-auto">
          <thead>
            <tr className="bg-yellow-100">
              <th className="p-4 text-yellow-600 font-semibold">Title</th>
              <th className="p-4 text-yellow-600 font-semibold">Experience (Years)</th>
              <th className="p-4 text-yellow-600 font-semibold">Price</th>
              <th className="p-4 text-yellow-600 font-semibold">Duration</th>
              <th className="p-4 text-yellow-600 font-semibold">Status</th>
              <th className="p-4 text-yellow-600 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {services.map((service) => (
              <tr key={service._id} className="border-b border-yellow-200 hover:bg-yellow-50">
                <td className="p-4 text-gray-700">{service.serviceTitle}</td>
                <td className="p-4 text-gray-700">{service.yearsOfExperience}</td>
                <td className="p-4 text-gray-700">₹{service.servicePrice.toFixed(2)}</td>
                <td className="p-4 text-gray-700">{service.serviceDuration}</td>
                <td className="p-4 text-gray-700">
                  <span className={`px-2 py-1 rounded-full text-sm ${service.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    {service.status}
                  </span>
                </td>
                <td className="p-4">
                  <button onClick={() => openModal(service)} className="mr-2 px-3 py-1 bg-yellow-400 text-white rounded-lg hover:bg-yellow-500 transition-colors">
                    Edit
                  </button>
                  <button onClick={() => openConfirmModal(service._id!, service.status === 'active' ? 'deactivate' : 'activate')} className="px-3 py-1 bg-yellow-400 text-white rounded-lg hover:bg-yellow-500 transition-colors">
                    {service.status === 'active' ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-yellow-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-yellow-600">Vendor Services</h1>
          <button onClick={() => openModal()} className="px-4 py-2 bg-yellow-400 text-white rounded-lg hover:bg-yellow-500 transition-colors" disabled={!vendorId}>
            Add New Service
          </button>
        </div>

        <div className="mb-6">
          <div className="relative">
            <input type="text" value={searchTerm} onChange={handleSearchChange} placeholder="Search services by title..." className="w-full p-3 pr-24 bg-white border-2 border-yellow-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-700" />
            {searchTerm && (
              <button onClick={clearSearch} className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-1 bg-yellow-400 text-white rounded-lg hover:bg-yellow-500 transition-colors text-sm">
                Clear
              </button>
            )}
          </div>
          {isSearching && (
            <p className="text-sm text-gray-600 mt-2">
              Searching for: <span className="font-semibold">"{debouncedSearchTerm}"</span>
            </p>
          )}
        </div>

        {renderContent()}

        {!currentLoading && !currentError && totalPages > 1 && (
          <div className="mt-8 flex justify-center gap-4">
            <button onClick={() => setPageNo((prev) => Math.max(prev - 1, 1))} disabled={pageNo === 1} className="px-4 py-2 bg-yellow-400 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-yellow-500 transition-colors">
              Previous
            </button>
            <span className="text-yellow-600 font-semibold">Page {pageNo} of {totalPages}</span>
            <button onClick={() => setPageNo((prev) => Math.min(prev + 1, totalPages))} disabled={pageNo === totalPages} className="px-4 py-2 bg-yellow-400 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-yellow-500 transition-colors">
              Next
            </button>
          </div>
        )}

        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 overflow-y-auto">
            <div className="relative bg-white rounded-lg p-8 w-full max-w-md mx-4 my-8 sm:mx-auto sm:my-12 border-2 border-yellow-400 max-h-[85vh] overflow-y-auto box-border">
              <button type="button" onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 text-2xl font-bold" aria-label="Close modal">
                &times;
              </button>
              <h2 className="text-2xl font-bold text-yellow-600 mb-6 pr-8">{editingService ? 'Edit Service' : 'Create Service'}</h2>
              {errorMessage && <div className="mb-4 text-red-600 text-sm bg-red-100 p-3 rounded-lg">{errorMessage}</div>}
              {categoriesError && <div className="mb-4 text-red-600 text-sm bg-red-100 p-3 rounded-lg">Failed to load categories: {categoriesError.message || 'Please try again.'}</div>}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="categoryId" className="block text-gray-700 font-medium mb-2">Category</label>
                  <select id="categoryId" name="categoryId" value={formData.categoryId} onChange={handleInputChange} className={`w-full p-3 bg-yellow-50 border-2 border-yellow-400 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 box-border appearance-none ${fieldErrors.categoryId ? 'border-red-500' : 'border-yellow-400'}`} required disabled={isLoadingCategories || !!categoriesError}>
                    {isLoadingCategories ? (
                      <option value="" disabled className="bg-yellow-50 text-gray-700">Loading categories...</option>
                    ) : categories.length === 0 && !categoriesError ? (
                      <option value="" disabled className="bg-yellow-50 text-gray-700">No categories available</option>
                    ) : (
                      <>
                        <option value="" disabled className="bg-yellow-50 text-gray-700">Select a category</option>
                        {categories.map((category) => (
                          <option key={category._id} value={category._id} className="bg-yellow-50 text-gray-700">{category.title}</option>
                        ))}
                      </>
                    )}
                  </select>
                  {fieldErrors.categoryId && <div className="text-red-600 text-sm mt-1">{fieldErrors.categoryId}</div>}
                </div>
                <div>
                  <label htmlFor="serviceTitle" className="block text-gray-700 font-medium mb-2">Service Title</label>
                  <input id="serviceTitle" type="text" name="serviceTitle" value={formData.serviceTitle} onChange={handleInputChange} className={`w-full p-3 bg-yellow-50 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 box-border ${fieldErrors.serviceTitle ? 'border-red-500' : 'border-yellow-400'}`} required />
                  {fieldErrors.serviceTitle && <div className="text-red-600 text-sm mt-1">{fieldErrors.serviceTitle}</div>}
                </div>
                <div>
                  <label htmlFor="yearsOfExperience" className="block text-gray-700 font-medium mb-2">Years of Experience</label>
                  <input id="yearsOfExperience" type="number" name="yearsOfExperience" value={formData.yearsOfExperience} onChange={handleInputChange} className={`w-full p-3 bg-yellow-50 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 box-border ${fieldErrors.yearsOfExperience ? 'border-red-500' : 'border-yellow-400'}`} required min="0" />
                  {fieldErrors.yearsOfExperience && <div className="text-red-600 text-sm mt-1">{fieldErrors.yearsOfExperience}</div>}
                </div>
                <div>
                  <label htmlFor="serviceDescription" className="block text-gray-700 font-medium mb-2">Service Description</label>
                  <textarea id="serviceDescription" name="serviceDescription" value={formData.serviceDescription} onChange={handleInputChange} className={`w-full p-3 bg-yellow-50 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 box-border ${fieldErrors.serviceDescription ? 'border-red-500' : 'border-yellow-400'}`} rows={3} required />
                  {fieldErrors.serviceDescription && <div className="text-red-600 text-sm mt-1">{fieldErrors.serviceDescription}</div>}
                </div>
                <div>
                  <label htmlFor="cancellationPolicy" className="block text-gray-700 font-medium mb-2">Cancellation Policy</label>
                  <textarea id="cancellationPolicy" name="cancellationPolicy" value={formData.cancellationPolicy} onChange={handleInputChange} className={`w-full p-3 bg-yellow-50 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 box-border ${fieldErrors.cancellationPolicy ? 'border-red-500' : 'border-yellow-400'}`} rows={2} required />
                  {fieldErrors.cancellationPolicy && <div className="text-red-600 text-sm mt-1">{fieldErrors.cancellationPolicy}</div>}
                </div>
                <div>
                  <label htmlFor="termsAndCondition" className="block text-gray-700 font-medium mb-2">Terms and Conditions</label>
                  <textarea id="termsAndCondition" name="termsAndCondition" value={formData.termsAndCondition} onChange={handleInputChange} className={`w-full p-3 bg-yellow-50 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 box-border ${fieldErrors.termsAndCondition ? 'border-red-500' : 'border-yellow-400'}`} rows={2} required />
                  {fieldErrors.termsAndCondition && <div className="text-red-600 text-sm mt-1">{fieldErrors.termsAndCondition}</div>}
                </div>
                <div>
                  <label htmlFor="serviceDuration" className="block text-gray-700 font-medium mb-2">Service Duration</label>
                  <input id="serviceDuration" type="text" name="serviceDuration" value={formData.serviceDuration} onChange={handleInputChange} className={`w-full p-3 bg-yellow-50 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 box-border ${fieldErrors.serviceDuration ? 'border-red-500' : 'border-yellow-400'}`} required />
                  {fieldErrors.serviceDuration && <div className="text-red-600 text-sm mt-1">{fieldErrors.serviceDuration}</div>}
                </div>
                <div>
                  <label htmlFor="servicePrice" className="block text-gray-700 font-medium mb-2">Service Price (₹)</label>
                  <input id="servicePrice" type="number" name="servicePrice" value={formData.servicePrice} onChange={handleInputChange} className={`w-full p-3 bg-yellow-50 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 box-border ${fieldErrors.servicePrice ? 'border-red-500' : 'border-yellow-400'}`} required min="0.01" step="0.01" />
                  {fieldErrors.servicePrice && <div className="text-red-600 text-sm mt-1">{fieldErrors.servicePrice}</div>}
                </div>
                <div>
                  <label htmlFor="additionalHourFee" className="block text-gray-700 font-medium mb-2">Additional Hour Fee (₹)</label>
                  <input id="additionalHourFee" type="number" name="additionalHourFee" value={formData.additionalHourFee} onChange={handleInputChange} className={`w-full p-3 bg-yellow-50 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 box-border ${fieldErrors.additionalHourFee ? 'border-red-500' : 'border-yellow-400'}`} required min="0.01" step="0.01" />
                  {fieldErrors.additionalHourFee && <div className="text-red-600 text-sm mt-1">{fieldErrors.additionalHourFee}</div>}
                </div>
                <div className="flex justify-end gap-4 pt-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-yellow-400 text-white rounded-lg hover:bg-yellow-500 transition-colors" disabled={createServiceMutation.isPending || editServiceMutation.isPending || !vendorId || isLoadingCategories}>
                    {editingService ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {isConfirmModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="relative bg-white rounded-lg p-6 w-full max-w-sm mx-4 border-2 border-yellow-400">
              <button type="button" onClick={() => setIsConfirmModalOpen(false)} className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 text-2xl font-bold" aria-label="Close confirmation modal">
                &times;
              </button>
              <h2 className="text-xl font-bold text-yellow-600 mb-4">Confirm {confirmAction === 'activate' ? 'Activation' : 'Deactivation'}</h2>
              <p className="text-gray-700 mb-6">Are you sure you want to {confirmAction === 'activate' ? 'activate' : 'deactivate'} this service?</p>
              <div className="flex justify-end gap-4">
                <button type="button" onClick={() => setIsConfirmModalOpen(false)} className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors">Cancel</button>
                <button type="button" onClick={handleStatusChange} className="px-4 py-2 bg-yellow-400 text-white rounded-lg hover:bg-yellow-500 transition-colors" disabled={changeStatusMutation.isPending}>Confirm</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorServicesPage;