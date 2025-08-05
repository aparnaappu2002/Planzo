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
  const { register, handleSubmit, setValue, watch, reset } = useForm<EventUpdateEntity>();
  const updateEventMutation = useUpdateEvent();
  const uploadImageMutation = useUploadImageMutation();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>(event?.posterImage || []);

  const watchedStatus = watch('status');

  // Reset form when event changes
  React.useEffect(() => {
    if (event) {
      reset({
        title: event.title,
        description: event.description,
        location: event.location,
        startTime: event.startTime,
        endTime: event.endTime,
        posterImage: event.posterImage,
        pricePerTicket: event.pricePerTicket,
        maxTicketsPerUser: event.maxTicketsPerUser,
        totalTicket: event.totalTicket,
        date: event.date,
        createdAt: event.createdAt,
        ticketPurchased: event.ticketPurchased,
        address: event.address,
        venueName: event.venueName,
        category: event.category,
        status: event.status,
      });
      setExistingImages(event.posterImage || []);
      setNewImages([]);
      setPreviewUrls([]);
    }
  }, [event, reset]);

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

  const onSubmit = async (data: EventUpdateEntity) => {
    if (!event) return;
    
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
    } catch (error) {
      let errorMessage 
            
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
                <Label htmlFor="title">Event Title</Label>
                <Input
                  id="title"
                  {...register('title', { required: true })}
                  placeholder="Enter event title"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  {...register('category', { required: true })}
                  placeholder="e.g., Music, Technology, Art"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register('description', { required: true })}
                placeholder="Enter event description"
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Event Status</Label>
              <Select
                value={watchedStatus}
                onValueChange={(value) => setValue('status', value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Date and Time */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Date & Time</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Date & Time</Label>
                <Input
                  id="startTime"
                  type="datetime-local"
                  {...register('startTime', { required: true })}
                  defaultValue={event.startTime ? format(new Date(event.startTime), "yyyy-MM-dd'T'HH:mm") : ''}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="endTime">End Date & Time</Label>
                <Input
                  id="endTime"
                  type="datetime-local"
                  {...register('endTime', { required: true })}
                  defaultValue={event.endTime ? format(new Date(event.endTime), "yyyy-MM-dd'T'HH:mm") : ''}
                />
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
                  {...register('venueName')}
                  placeholder="Enter venue name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  {...register('address')}
                  placeholder="Enter full address"
                />
              </div>
            </div>
          </div>

          {/* Ticket Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Ticket Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pricePerTicket">Price per Ticket ($)</Label>
                <Input
                  id="pricePerTicket"
                  type="number"
                  step="0.01"
                  min="0"
                  {...register('pricePerTicket', { required: true, valueAsNumber: true })}
                  placeholder="0.00"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="totalTicket">Total Tickets</Label>
                <Input
                  id="totalTicket"
                  type="number"
                  min="1"
                  {...register('totalTicket', { required: true, valueAsNumber: true })}
                  placeholder="100"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="maxTicketsPerUser">Max Tickets per User</Label>
                <Input
                  id="maxTicketsPerUser"
                  type="number"
                  min="1"
                  {...register('maxTicketsPerUser', { required: true, valueAsNumber: true })}
                  placeholder="4"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Current Sales</Label>
              <div className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
                <strong>{event.ticketPurchased}</strong> tickets sold out of{' '}
                <strong>{event.totalTicket}</strong> total tickets
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