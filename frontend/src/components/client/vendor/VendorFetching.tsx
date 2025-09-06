import React from 'react';
import { useFindVendorForCarousal } from '@/hooks/clientCustomHooks';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom'; // Assuming react-router-dom for navigation

// Define the VendorEntity interface based on API response
interface VendorEntity {
  _id: string;
  name: string;
  profileImage?: string; // Optional Cloudinary URL
  idProof?:string
}

// Define the API response structure
interface VendorsResponse {
  message: string;
  vendors: VendorEntity[];
}

const VendorCards: React.FC = () => {
  const { data: vendorsResponse, isLoading, error } = useFindVendorForCarousal();
  

  // Extract vendors array from response
  const vendors = (vendorsResponse as VendorsResponse)?.vendors || [];
  console.log(vendors)

  // Handle error state
  if (error) {
    toast.error('Failed to load vendors: ' + (error.message || 'Unknown error'));
    return (
      <div className="min-h-screen bg-yellow-50 p-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-yellow-600">Error loading vendors. Please try again later.</p>
        </div>
      </div>
    );
  }

  // Handle loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-yellow-50 p-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-yellow-600">Loading vendors...</p>
        </div>
      </div>
    );
  }

  // Handle empty state
  if (!vendors || vendors.length === 0) {
    return (
      <div className="min-h-screen bg-yellow-50 p-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-yellow-600">No vendors found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-yellow-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-yellow-800 mb-4">Vendors</h2>
        <div className="bg-white rounded-lg shadow-lg p-6 border border-yellow-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {vendors.map((vendor: VendorEntity) => (
              <div
                key={vendor._id}
                className="bg-yellow-50 rounded-lg border border-yellow-300 p-4 flex flex-col items-center"
              >
                {vendor.profileImage || vendor.idProof ? (
                  <img
                    src={vendor.profileImage || vendor.idProof}
                    alt={vendor.name}
                    className="w-32 h-32 object-cover rounded-full border border-yellow-200 mb-4"
                  />
                ) : (
                  <div className="w-32 h-32 bg-yellow-100 rounded-full border border-yellow-200 mb-4 flex items-center justify-center">
                    <p className="text-yellow-600">No image</p>
                  </div>
                )}
                <h3 className="text-lg font-semibold text-yellow-800">{vendor.name}</h3>
                
                <Link
                  to={`/vendors/${vendor._id}`}
                  className="mt-4 bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition-colors"
                >
                  View Details
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorCards;