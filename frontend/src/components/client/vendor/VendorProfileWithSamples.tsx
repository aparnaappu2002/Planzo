import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useFindVendorProfileWithSample } from '@/hooks/clientCustomHooks';
import Slider from 'react-slick';
// Ensure slick-carousel is installed: npm install slick-carousel
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

interface VendorProfile {
  _id: string;
  vendorId: {
    _id: string;
    name: string;
    profileImage: string;
  };
  title: string;
  description: string;
  images: string[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface ApiResponse {
  message: string;
  vendorProfile: VendorProfile[];
  services: any[];
  totalPages: number;
}

const VendorProfileWithSamples: React.FC = () => {
  const { vendorId } = useParams<{ vendorId: string }>();
  const [pageNo, setPageNo] = useState<number>(1);
  const { data, isLoading, error } = useFindVendorProfileWithSample(vendorId!, pageNo);

  // Slider settings for react-slick
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    swipe: true,
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-yellow-50">
        <div className="text-yellow-600 text-xl animate-pulse">Loading...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex justify-center items-center h-screen bg-yellow-50">
        <div className="text-red-600 text-xl">Error: {error?.message || 'Failed to load data'}</div>
      </div>
    );
  }

  const { vendorProfile, totalPages } = data as ApiResponse;

  // Use the first profile for vendor details (assuming vendor details are consistent)
  const vendor = vendorProfile[0]?.vendorId;

  return (
    <div className="min-h-screen bg-yellow-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Vendor Details Section */}
        {vendor && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8 border-2 border-yellow-400">
            <h1 className="text-3xl font-bold text-yellow-600 mb-4">{vendor.name}</h1>
            <p className="text-gray-700 mb-4">{vendorProfile[0]?.description || 'No description available'}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600">
                  <span className="font-semibold text-yellow-600">Title:</span>{' '}
                  {vendorProfile[0]?.title || 'No title available'}
                </p>
              </div>
              <div>
                <p className="text-gray-600">
                  <span className="font-semibold text-yellow-600">Created At:</span>{' '}
                  {vendorProfile[0]?.createdAt
                    ? new Date(vendorProfile[0].createdAt).toLocaleDateString()
                    : 'N/A'}
                </p>
              </div>
            </div>
            {vendor.profileImage && (
              <div className="mt-4">
                <img
                  src={vendor.profileImage}
                  alt={vendor.name}
                  className="w-32 h-32 rounded-full object-cover border-2 border-yellow-400"
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/128?text=No+Image';
                  }}
                />
              </div>
            )}
          </div>
        )}

        {/* Work Samples Section */}
        <h2 className="text-2xl font-bold text-yellow-600 mb-4">Work Samples</h2>
        {vendorProfile.length === 0 || vendorProfile.every(profile => profile.images.length === 0) ? (
          <p className="text-gray-600">No work samples available.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vendorProfile.map((profile) => (
              <div
                key={profile._id}
                className="bg-white rounded-lg shadow-md overflow-hidden border-2 border-yellow-400 hover:shadow-lg transition-shadow"
              >
                {profile.images.length > 0 ? (
                  <Slider {...sliderSettings}>
                    {profile.images.map((imageUrl, index) => (
                      <div key={`${profile._id}-${index}`}>
                        <img
                          src={imageUrl}
                          alt={`${profile.title || 'Sample'} ${index + 1}`}
                          className="w-full h-48 object-cover"
                          onError={(e) => {
                            e.currentTarget.src = 'https://via.placeholder.com/1920x1080?text=No+Image';
                          }}
                        />
                      </div>
                    ))}
                  </Slider>
                ) : (
                  <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                    <p className="text-gray-600">No images available</p>
                  </div>
                )}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-yellow-600">
                    {profile.title || 'Untitled Work Sample'}
                  </h3>
                  <p className="text-gray-600 mt-2">{profile.description || 'No description available'}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center gap-4">
            <button
              onClick={() => setPageNo((prev) => Math.max(prev - 1, 1))}
              disabled={pageNo === 1}
              className="px-4 py-2 bg-yellow-400 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-yellow-500 transition-colors"
            >
              Previous
            </button>
            <span className="text-yellow-600 font-semibold">
              Page {pageNo} of {totalPages}
            </span>
            <button
              onClick={() => setPageNo((prev) => Math.min(prev + 1, totalPages))}
              disabled={pageNo === totalPages}
              className="px-4 py-2 bg-yellow-400 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-yellow-500 transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorProfileWithSamples;