import { EventType } from '@/types/EventType';
import { EventUpdateEntity } from '@/types/EventUpdateEntity';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { useUpdateEvent, useUploadImageMutation } from '@/hooks/vendorCustomHooks';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { CalendarDays, Save, X, Image as ImageIcon, Trash2 } from 'lucide-react';
import React, { useState, useCallback } from 'react';

interface EventEditModalProps {
  event: EventType | null;
  isOpen: boolean;
  onClose: () => void;
}

export const EventEditModal = ({ event, isOpen, onClose }: EventEditModalProps) => {
  const { 
    register, 
    handleSubmit, 
    setValue, 
    watch, 
    reset, 
    formState: { errors },
    getValues 
  } = useForm<EventUpdateEntity>();
  
  const updateEventMutation = useUpdateEvent();
  const uploadImageMutation = useUploadImageMutation();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>(event?.posterImage || []);

  const watchedStatus = watch('status');

  // Helper function to format date for datetime-local input
  const formatDateForInput = (dateString: string | Date) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return format(date, "yyyy-MM-dd'T'HH:mm");
  };

  // Reset form when event changes
  React.useEffect(() => {
    if (event) {
      reset({
        title: event.title,
        description: event.description,
        location: event.location,
        startTime: formatDateForInput(event.startTime),
        endTime: formatDateForInput(event.endTime),
        posterImage: event.posterImage,
        pricePerTicket: event.pricePerTicket,
        maxTicketsPerUser: event.maxTicketsPerUser,
        totalTicket: event.totalTicket,
        date: event.date ? format(new Date(event.date), 'yyyy-MM-dd') : '',
        createdAt: event.createdAt,
        ticketPurchased: event.ticketPurchased,
        address: event.address,
        venueName: event.venueName,
        category: event.category,
        status: event.status,
      });
      
      // Explicitly set the datetime values using setValue to ensure they populate
      setValue('startTime', formatDateForInput(event.startTime));
      setValue('endTime', formatDateForInput(event.endTime));
      setValue('date', event.date ? format(new Date(event.date), 'yyyy-MM-dd') : '');
      
      setExistingImages(event.posterImage || []);
      setNewImages([]);
      setPreviewUrls([]);
    }
  }, [event, reset, setValue]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    
    const files = Array.from(e.target.files);
    const newPreviewUrls: string[] = [];
    
    // Validate file types and sizes
    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/');
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB max
      
      if (!isValidType) {
        toast.error(`Invalid file type: ${file.name}. Only images are allowed.`);
        return false;
      }
      if (!isValidSize) {
        toast.error(`File too large: ${file.name}. Max size is 5MB.`);
        return false;
      }
      return true;
    });

    // Create preview URLs
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        newPreviewUrls.push(reader.result as string);
        if (newPreviewUrls.length === validFiles.length) {
          setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
        }
      };
      reader.readAsDataURL(file);
    });

    setNewImages(prev => [...prev, ...validFiles]);
  };

  const removeNewImage = (index: number) => {
    setNewImages(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const uploadImages = async (images: File[]): Promise<string[]> => {
    const uploadPromises = images.map(async (image) => {
      const formData = new FormData();
      formData.append("file", image);
      formData.append("upload_preset", "Planzo");
      
      try {
        const response = await uploadImageMutation.mutateAsync(formData);
        return response.url || response.secure_url;
      } catch (error) {
        console.error('Image upload failed:', error);
        throw error;
      }
    });

    return Promise.all(uploadPromises);
  };

  // Custom validation functions
  const validateDateTime = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const now = new Date();
    
    if (start < now) {
      return 'Start time cannot be in the past';
    }
    
    if (end <= start) {
      return 'End time must be after start time';
    }
    
    // Check if the time difference is reasonable (at least 30 minutes)
    const timeDiff = end.getTime() - start.getTime();
    const minDuration = 30 * 60 * 1000; // 30 minutes in milliseconds
    
    if (timeDiff < minDuration) {
      return 'Event must be at least 30 minutes long';
    }
    
    return true;
  };

  const validateTickets = (maxTickets: number, totalTickets: number, soldTickets: number = 0) => {
    if (maxTickets > totalTickets) {
      return 'Max tickets per user cannot exceed total tickets';
    }
    
    if (totalTickets < soldTickets) {
      return `Total tickets cannot be less than already sold tickets (${soldTickets})`;
    }
    
    return true;
  };

  const onSubmit = async (data: EventUpdateEntity) => {
    if (!event) return;
    
    // Additional validation before submission
    const startTime = data.startTime;
    const endTime = data.endTime;
    const soldTickets = event.ticketPurchased || 0;
    
    if (startTime && endTime) {
      const dateValidation = validateDateTime(startTime, endTime);
      if (dateValidation !== true) {
        toast.error(dateValidation);
        return;
      }
    }
    
    const ticketValidation = validateTickets(data.maxTicketsPerUser!, data.totalTicket!, soldTickets);
    if (ticketValidation !== true) {
      toast.error(ticketValidation);
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Upload new images first if any
      let uploadedImageUrls: string[] = [];
      if (newImages.length > 0) {
        uploadedImageUrls = await uploadImages(newImages);
      }

      // Combine existing images (minus any removed) with new uploaded images
      const allImages = [...existingImages, ...uploadedImageUrls];

      // Fix the location object structure before sending
      const updateData = { 
        ...data,
        posterImage: allImages
      };
      
      // If location exists but is incomplete, fix it
      if (updateData.location && updateData.location.type === 'Point') {
        // If coordinates are missing or invalid, provide default coordinates
        if (!updateData.location.coordinates || !Array.isArray(updateData.location.coordinates)) {
          // Default coordinates (0, 0) - you might want to use actual coordinates
          // Or remove the location field entirely if not needed
          updateData.location = {
            type: 'Point',
            coordinates: [0, 0] // [longitude, latitude]
          };
        }
      }
      
      const response = await updateEventMutation.mutateAsync({
        eventId: event._id,
        update: updateData,
      });
      
      toast.success(response.message);
      onClose();
    } catch (error: any) {
      let errorMessage;
            
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      toast.error(errorMessage || "Failed to update event");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!event) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-3">
            <CalendarDays className="h-6 w-6" />
            Edit Event
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Event Title *</Label>
                <Input
                  id="title"
                  {...register('title', { 
                    required: 'Event title is required',
                    minLength: { value: 3, message: 'Title must be at least 3 characters' },
                    maxLength: { value: 100, message: 'Title cannot exceed 100 characters' }
                  })}
                  placeholder="Enter event title"
                  className={errors.title ? 'border-red-500' : ''}
                />
                {errors.title && (
                  <p className="text-sm text-red-500">{errors.title.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Input
                  id="category"
                  {...register('category', { 
                    required: 'Category is required',
                    minLength: { value: 2, message: 'Category must be at least 2 characters' }
                  })}
                  placeholder="e.g., Music, Technology, Art"
                  className={errors.category ? 'border-red-500' : ''}
                />
                {errors.category && (
                  <p className="text-sm text-red-500">{errors.category.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                {...register('description', { 
                  required: 'Description is required',
                  minLength: { value: 10, message: 'Description must be at least 10 characters' },
                  maxLength: { value: 1000, message: 'Description cannot exceed 1000 characters' }
                })}
                placeholder="Enter event description"
                rows={4}
                className={errors.description ? 'border-red-500' : ''}
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Event Status *</Label>
              <Select
                value={watchedStatus}
                onValueChange={(value) => setValue('status', value as any)}
              >
                <SelectTrigger className={errors.status ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              {errors.status && (
                <p className="text-sm text-red-500">Event status is required</p>
              )}
            </div>
          </div>

          {/* Date and Time */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Date & Time</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Event Date *</Label>
                <Input
                  id="date"
                  type="date"
                  {...register('date', { 
                    required: 'Event date is required'
                  })}
                  className={errors.date ? 'border-red-500' : ''}
                />
                {errors.date && (
                  <p className="text-sm text-red-500">{errors.date.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Date & Time *</Label>
                <Input
                  id="startTime"
                  type="datetime-local"
                  {...register('startTime', { 
                    required: 'Start time is required',
                    validate: (value) => {
                      const now = new Date();
                      const startDate = new Date(value);
                      if (startDate < now) {
                        return 'Start time cannot be in the past';
                      }
                      return true;
                    }
                  })}
                  className={errors.startTime ? 'border-red-500' : ''}
                />
                {errors.startTime && (
                  <p className="text-sm text-red-500">{errors.startTime.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="endTime">End Date & Time *</Label>
                <Input
                  id="endTime"
                  type="datetime-local"
                  {...register('endTime', { 
                    required: 'End time is required',
                    validate: (value) => {
                      const startTime = getValues('startTime');
                      if (startTime && new Date(value) <= new Date(startTime)) {
                        return 'End time must be after start time';
                      }
                      return true;
                    }
                  })}
                  className={errors.endTime ? 'border-red-500' : ''}
                />
                {errors.endTime && (
                  <p className="text-sm text-red-500">{errors.endTime.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Location</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="venueName">Venue Name</Label>
                <Input
                  id="venueName"
                  {...register('venueName', {
                    maxLength: { value: 100, message: 'Venue name cannot exceed 100 characters' }
                  })}
                  placeholder="Enter venue name"
                  className={errors.venueName ? 'border-red-500' : ''}
                />
                {errors.venueName && (
                  <p className="text-sm text-red-500">{errors.venueName.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  {...register('address', {
                    maxLength: { value: 200, message: 'Address cannot exceed 200 characters' }
                  })}
                  placeholder="Enter full address"
                  className={errors.address ? 'border-red-500' : ''}
                />
                {errors.address && (
                  <p className="text-sm text-red-500">{errors.address.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Ticket Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Ticket Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pricePerTicket">Price per Ticket ($) *</Label>
                <Input
                  id="pricePerTicket"
                  type="number"
                  step="0.01"
                  min="0"
                  {...register('pricePerTicket', { 
                    required: 'Price per ticket is required',
                    min: { value: 0, message: 'Price cannot be negative' },
                    max: { value: 10000, message: 'Price cannot exceed $10,000' },
                    valueAsNumber: true 
                  })}
                  placeholder="0.00"
                  className={errors.pricePerTicket ? 'border-red-500' : ''}
                />
                {errors.pricePerTicket && (
                  <p className="text-sm text-red-500">{errors.pricePerTicket.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="totalTicket">Total Tickets *</Label>
                <Input
                  id="totalTicket"
                  type="number"
                  min={event.ticketPurchased || 1}
                  {...register('totalTicket', { 
                    required: 'Total tickets is required',
                    min: { value: event.ticketPurchased || 1, message: `Cannot be less than already sold tickets (${event.ticketPurchased || 0})` },
                    max: { value: 100000, message: 'Cannot exceed 100,000 tickets' },
                    valueAsNumber: true,
                    validate: (value) => {
                      const soldTickets = event.ticketPurchased || 0;
                      if (value < soldTickets) {
                        return `Total tickets cannot be less than already sold tickets (${soldTickets})`;
                      }
                      return true;
                    }
                  })}
                  placeholder="100"
                  className={errors.totalTicket ? 'border-red-500' : ''}
                />
                {errors.totalTicket && (
                  <p className="text-sm text-red-500">{errors.totalTicket.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="maxTicketsPerUser">Max Tickets per User *</Label>
                <Input
                  id="maxTicketsPerUser"
                  type="number"
                  min="1"
                  {...register('maxTicketsPerUser', { 
                    required: 'Max tickets per user is required',
                    min: { value: 1, message: 'Must allow at least 1 ticket per user' },
                    max: { value: 100, message: 'Cannot exceed 100 tickets per user' },
                    valueAsNumber: true 
                  })}
                  placeholder="4"
                  className={errors.maxTicketsPerUser ? 'border-red-500' : ''}
                />
                {errors.maxTicketsPerUser && (
                  <p className="text-sm text-red-500">{errors.maxTicketsPerUser.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Current Sales</Label>
              <div className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
                <strong>{event.ticketPurchased || 0}</strong> tickets sold out of{' '}
                <strong>{event.totalTicket}</strong> total tickets
                {event.totalTicket && event.ticketPurchased && (
                  <span className="ml-2">
                    ({Math.round((event.ticketPurchased / event.totalTicket) * 100)}% sold)
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Poster Images */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Poster Images</h3>
            
            {/* Existing Images */}
            {existingImages.length > 0 && (
              <div className="space-y-2">
                <Label>Existing Images</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {existingImages.map((url, index) => (
                    <div key={index} className="relative group">
                      <img 
                        src={url} 
                        alt={`Event image ${index}`}
                        className="w-full h-32 object-cover rounded-lg border border-border/60"
                      />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* New Image Upload */}
            <div className="space-y-2">
              <Label htmlFor="posterImage" className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                Upload New Images
              </Label>
              <Input
                id="posterImage"
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="border-border/60 focus:border-primary file:bg-secondary file:border-0 file:text-secondary-foreground"
                disabled={isSubmitting}
              />
              <p className="text-xs text-muted-foreground">
                Maximum file size: 5MB per image. Supported formats: JPG, PNG, GIF, WebP
              </p>
            </div>
            
            {/* New Image Previews */}
            {previewUrls.length > 0 && (
              <div className="space-y-2">
                <Label>New Images to Upload</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {previewUrls.map((url, index) => (
                    <div key={index} className="relative group">
                      <img 
                        src={url} 
                        alt={`Preview ${index}`}
                        className="w-full h-32 object-cover rounded-lg border border-border/60"
                      />
                      <button
                        type="button"
                        onClick={() => removeNewImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex gap-4 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};