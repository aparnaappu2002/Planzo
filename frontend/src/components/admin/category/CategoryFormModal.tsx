import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X } from 'lucide-react';
import { Category, CreateCategoryData } from '@/types/Category';
import { CategoryUpdate } from '@/types/CategoryUpdate';
import { useUploadImageMutation } from '@/hooks/vendorCustomHooks';
import { toast } from 'react-toastify';

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateCategoryData | { categoryId: string; updates: CategoryUpdate }) => void;
  category?: Category | null;
  isPending?: boolean;
}

export const CategoryFormModal: React.FC<CategoryFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  category,
  isPending = false
}) => {
  const [title, setTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>('');
  const [errors, setErrors] = useState<{ title?: string; image?: string }>({});
  
  const uploadImageMutation = useUploadImageMutation();

  useEffect(() => {
    if (category) {
      setTitle(category.title);
      setImagePreview(category.image || null);
      setUploadedImageUrl(category.image || '');
    } else {
      setTitle('');
      setSelectedFile(null);
      setImagePreview(null);
      setUploadedImageUrl('');
    }
    // Clear errors when modal opens/closes or category changes
    setErrors({});
  }, [category, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: { title?: string; image?: string } = {};

    // Title validation
    if (!title.trim()) {
      newErrors.title = 'Category title is required';
    } else if (title.trim().length < 2) {
      newErrors.title = 'Category title must be at least 2 characters';
    } else if (title.trim().length > 50) {
      newErrors.title = 'Category title must not exceed 50 characters';
    }

    // Image validation - required for both create and update
    if (!selectedFile && !uploadedImageUrl) {
      newErrors.image = 'Category image is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        toast.error('Please select a valid image file (JPEG, PNG, or WebP)');
        return;
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        toast.error('Image size must be less than 5MB');
        return;
      }

      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      
      // Clear image error if file is selected
      if (errors.image) {
        setErrors(prev => ({ ...prev, image: undefined }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form before submission
    if (!validateForm()) {
      toast.error('Please fix the errors before submitting');
      return;
    }

    try {
      let imageUrl = uploadedImageUrl;

      // Upload new image if a file was selected
      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("upload_preset", "Planzo");
        
        const uploadResult = await uploadImageMutation.mutateAsync(formData);
        imageUrl = uploadResult.url;
      }

      if (category) {
        // For updates - ensure we have the category _id
        if (!category._id) {
          toast.error('Category ID is missing');
          return;
        }
        
        const updates: CategoryUpdate = { 
          title: title.trim(),
          image: imageUrl 
        };
        
        // Fix: Use categoryId instead of _id to match the expected interface
        await onSubmit({
          categoryId: category._id,
          updates
        });
        
      } else {
        // For creation - ensure we have an image
        if (!imageUrl) {
          toast.error('Image is required for creating a category');
          return;
        }
        
        const createData: CreateCategoryData = { 
          title: title.trim(),
          image: imageUrl 
        };
        
        await onSubmit(createData);
      }
      
    } catch (error) {
      console.error('Error submitting category:', error);
      
      // Handle specific error messages
      if (error instanceof Error) {
        if (error.message.includes('image') && error.message.includes('required')) {
          toast.error('Category image is required');
        } else if (error.message.includes('No category presented in ID')) {
          toast.error('Category not found. Please refresh and try again.');
        } else if (error.message.includes('validation failed')) {
          toast.error('Please check all required fields');
        } else {
          toast.error(error.message || 'Failed to save category');
        }
      } else {
        toast.error('An unexpected error occurred. Please try again.');
      }
    }
  };

  const removeImage = () => {
    setSelectedFile(null);
    setImagePreview(null);
    setUploadedImageUrl('');
    // Clear image error when image is removed
    if (errors.image) {
      setErrors(prev => ({ ...prev, image: undefined }));
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    // Clear title error when user starts typing
    if (errors.title) {
      setErrors(prev => ({ ...prev, title: undefined }));
    }
  };

  const isSubmitDisabled = isPending || uploadImageMutation.isPending || !title.trim();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {category ? 'Edit Category' : 'Create New Category'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-foreground">Category Title</Label>
            <Input
              id="title"
              value={title}
              onChange={handleTitleChange}
              placeholder="Enter category title"
              className={`border-muted focus:border-primary ${errors.title ? 'border-red-500 focus:border-red-500' : ''}`}
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-foreground">Category Image *</Label>
            <div className="space-y-3">
              {imagePreview ? (
                <div className="relative inline-block">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded-lg border border-muted"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                    onClick={removeImage}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <label className={`flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors ${
                  errors.image ? 'border-red-500' : 'border-muted'
                }`}>
                  <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                  <span className="text-xs text-muted-foreground">Upload Image</span>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </label>
              )}
            </div>
            {errors.image && (
              <p className="text-sm text-red-500">{errors.image}</p>
            )}
            {uploadImageMutation.isPending && (
              <p className="text-sm text-muted-foreground">Uploading image...</p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitDisabled} 
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              {uploadImageMutation.isPending ? 'Uploading...' : 
               isPending ? 'Saving...' : 
               category ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};