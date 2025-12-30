import React, { useState } from 'react';
import { useCreateWorkSample, useFindWorkSamples, useUploadImageMutation } from '@/hooks/vendorCustomHooks';
import { WorkSamplesEntity } from '@/types/WorkSampleEntity';
import { RootState } from '@/redux/Store';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

interface WorkSamplesResponse {
  message: string;
  workSamples: WorkSamplesEntity[];
  totalPages: number;
}

const WorkSamplesPage: React.FC = () => {
  const [pageNo, setPageNo] = useState(1);
  const [formData, setFormData] = useState<Omit<WorkSamplesEntity, '_id' | 'vendorId'>>({
    title: '',
    description: '',
    images: [],
  });

  const vendorId = useSelector((state: RootState) => state.vendorSlice.vendor?._id);
  const { mutate: createWorkSample, isPending: isCreating } = useCreateWorkSample();
  const { data: workSamplesResponse, isLoading: isLoadingSamples } = useFindWorkSamples(vendorId || '', pageNo);
  const uploadImageMutation = useUploadImageMutation();
  const { mutateAsync: uploadImage, isPending: isUploading } = uploadImageMutation;

  // Extract workSamples array from response
  const workSamples = (workSamplesResponse as WorkSamplesResponse)?.workSamples || [];

  // Handle text input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Upload multiple images
  const uploadImages = async (images: File[]): Promise<string[]> => {
    const uploadPromises = images.map(async (image) => {
      const formData = new FormData();
      formData.append('file', image);
      formData.append('upload_preset', 'Planzo');

      try {
        const response = await uploadImage(formData);
        return response.secure_url || response.url;
      } catch (error) {
        console.error('Image upload failed:', error);
        throw error;
      }
    });

    return Promise.all(uploadPromises);
  };

  // Handle image upload
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      // Validate file types and sizes
      const validFiles = Array.from(files).filter((file) => {
        const isValidType = ['image/jpeg', 'image/png'].includes(file.type);
        const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB limit
        if (!isValidType) {
          toast.warn(`Invalid file type: ${file.name}. Only JPEG/PNG allowed.`);
          return false;
        }
        if (!isValidSize) {
          toast.warn(`File too large: ${file.name}. Maximum size is 10MB.`);
          return false;
        }
        return true;
      });

      if (validFiles.length === 0) {
        toast.error('No valid files selected.');
        return;
      }

      try {
        const imageUrls = await uploadImages(validFiles);
        if (imageUrls.length === 0) {
          toast.error('No valid image URLs returned from Cloudinary.');
          return;
        }

        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, ...imageUrls],
        }));
        toast.success(`${imageUrls.length} image(s) uploaded successfully!`);
      } catch (error: any) {
        console.error('Image upload failed:', error.message || error);
        toast.error('Failed to upload images: ' + (error.message || 'Unknown error'));
      }
    }
  };

  // Handle image removal
  const handleRemoveImage = (indexToRemove: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, index) => index !== indexToRemove),
    }));
    toast.info('Image removed from preview.');
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorId) {
      toast.error('Vendor ID not found. Please log in.');
      return;
    }

    if (formData.images.length === 0) {
      toast.error('Please upload at least one image.');
      return;
    }

    createWorkSample(
      { ...formData, vendorId },
      {
        onSuccess: () => {
          setFormData({ title: '', description: '', images: [] });
          toast.success('Work sample created successfully!');
        },
        onError: (error: any) => {
          toast.error('Failed to create work sample: ' + (error.message || 'Unknown error'));
        },
      }
    );
  };

  // Check if vendorId exists
  if (!vendorId) {
    return (
      <div className="min-h-screen bg-yellow-50 p-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-yellow-600">Please log in as a vendor to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-yellow-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Create Work Sample Form */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8 border border-yellow-200">
          <h2 className="text-2xl font-bold text-yellow-800 mb-4">Create Work Sample</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-yellow-800 font-medium">
                Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full p-2 border border-yellow-300 rounded focus:outline-none focus:ring-2 focus:ring-yellow-500"
                required
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-yellow-800 font-medium">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full p-2 border border-yellow-300 rounded focus:outline-none focus:ring-2 focus:ring-yellow-500"
                rows={4}
                required
              />
            </div>
            <div>
              <label htmlFor="images" className="block text-yellow-800 font-medium">
                Images
              </label>
              <input
                type="file"
                id="images"
                multiple
                accept="image/jpeg,image/png"
                onChange={handleImageChange}
                className="w-full p-2 border border-yellow-300 rounded focus:outline-none focus:ring-2 focus:ring-yellow-500"
                disabled={isUploading}
              />
              {isUploading && (
                <p className="text-yellow-600 mt-2">Uploading images...</p>
              )}
              <div className="mt-2 flex flex-wrap gap-2">
                {formData.images.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={image}
                      alt={`Preview ${index}`}
                      className="w-20 h-20 object-cover rounded border border-yellow-300"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <button
              type="submit"
              disabled={isCreating || isUploading}
              className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 disabled:bg-yellow-300 transition-colors"
            >
              {isCreating ? 'Creating...' : 'Create Work Sample'}
            </button>
          </form>
        </div>

        {/* Work Samples List */}
        <div className="bg-white rounded-lg shadow-lg p-6 border border-yellow-200">
          <h2 className="text-2xl font-bold text-yellow-800 mb-4">Work Samples</h2>
          {isLoadingSamples ? (
            <p className="text-yellow-600">Loading work samples...</p>
          ) : workSamples.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {workSamples.map((sample: WorkSamplesEntity) => (
                <div
                  key={sample._id}
                  className="border border-yellow-300 rounded-lg p-4 bg-yellow-50"
                >
                  <h3 className="text-lg font-semibold text-yellow-800">{sample.title}</h3>
                  <p className="text-yellow-700 mb-2">{sample.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {sample.images.length > 0 ? (
                      sample.images.map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt={`${sample.title} ${index}`}
                          className="w-24 h-24 object-cover rounded border border-yellow-200"
                        />
                      ))
                    ) : (
                      <p className="text-yellow-600">No images available</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-yellow-600">No work samples found.</p>
          )}
          <div className="mt-4 flex justify-between">
            <button
              onClick={() => setPageNo((prev) => Math.max(prev - 1, 1))}
              disabled={pageNo === 1}
              className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 disabled:bg-yellow-300 transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => setPageNo((prev) => prev + 1)}
              disabled={(workSamplesResponse as WorkSamplesResponse)?.totalPages <= pageNo}
              className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 disabled:bg-yellow-300 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkSamplesPage;