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
import { CalendarDays, Save, X, Image as ImageIcon, Trash2, Plus, Minus } from 'lucide-react';
import React, { useState, useCallback } from 'react';

interface TicketVariant {
  type: string;
  price: number;
  totalTickets: number;
  ticketsSold?: number;
  maxPerUser: number;
  description?: string;
  benefits?: string[];
}

interface EventEditModalProps {
  event: EventType | null;
  isOpen: boolean;
  onClose: () => void;
  onEventUpdated?: (updatedEvent: EventType) => void; 
}

const TICKET_TYPES = [
  { value: 'standard', label: 'Standard' },
  { value: 'premium', label: 'Premium' },
  { value: 'vip', label: 'VIP' },
  
];

export const EventEditModal = ({ event, isOpen, onClose, onEventUpdated }: EventEditModalProps) => {
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
  const [ticketVariants, setTicketVariants] = useState<TicketVariant[]>([]);
  const [useTicketVariants, setUseTicketVariants] = useState(false);

  const watchedStatus = watch('status');

  // Helper function to format date for datetime-local input
  const formatDateForInput = (dateString: string | Date) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return format(date, "yyyy-MM-dd'T'HH:mm");
  };

  React.useEffect(() => {
    if (event) {
      const hasTicketVariants = event.ticketVariants && event.ticketVariants.length > 0;
      setUseTicketVariants(hasTicketVariants);
      
      if (hasTicketVariants) {
        setTicketVariants(event.ticketVariants.map(variant => ({
          type: variant.type || 'standard',
          price: variant.price || 0,
          totalTickets: variant.totalTickets || 0,
          ticketsSold: variant.ticketsSold || 0,
          maxPerUser: variant.maxPerUser || 2,
          description: variant.description || '',
          benefits: variant.benefits || []
        })));
      }

      let eventDate = '';
      if (event.date) {
        const dateValue = Array.isArray(event.date) ? event.date[0] : event.date;
        eventDate = format(new Date(dateValue), 'yyyy-MM-dd');
      }

      reset({
        title: event.title,
        description: event.description,
        location: event.location,
        startTime: formatDateForInput(event.startTime),
        endTime: formatDateForInput(event.endTime),
        posterImage: event.posterImage,
        pricePerTicket: hasTicketVariants ? 0 : (event.pricePerTicket || 0),
        maxTicketsPerUser: hasTicketVariants ? 
          (event.ticketVariants?.[0]?.maxPerUser || 2) : 
          (event.maxTicketsPerUser || 1),
        totalTicket: hasTicketVariants ? 0 : (event.totalTicket || 0),
        date: eventDate,
        createdAt: event.createdAt,
        ticketPurchased: event.ticketPurchased || 0,
        address: event.address,
        venueName: event.venueName,
        category: event.category,
        status: event.status,
        ticketVariants: event.ticketVariants || []
      });
      
      setValue('startTime', formatDateForInput(event.startTime));
      setValue('endTime', formatDateForInput(event.endTime));
      setValue('date', eventDate);
      
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

  const addTicketVariant = () => {
    setTicketVariants(prev => [...prev, { 
      type: 'standard', 
      price: 0, 
      totalTickets: 0, 
      ticketsSold: 0,
      maxPerUser: 2,
      description: '',
      benefits: []
    }]);
  };

  const removeTicketVariant = (index: number) => {
    setTicketVariants(prev => prev.filter((_, i) => i !== index));
  };

  const updateTicketVariant = (index: number, field: keyof TicketVariant, value: string | number | string[]) => {
    setTicketVariants(prev => prev.map((variant, i) => 
      i === index ? { ...variant, [field]: value } : variant
    ));
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
    
    const timeDiff = end.getTime() - start.getTime();
    const minDuration = 30 * 60 * 1000; 
    
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

  const validateTicketVariants = (variants: TicketVariant[]) => {
    const usedTypes = new Set<string>();
    
    for (let i = 0; i < variants.length; i++) {
      const variant = variants[i];
      
      if (usedTypes.has(variant.type)) {
        const typeLabel = TICKET_TYPES.find(t => t.value === variant.type)?.label || variant.type;
        return `Duplicate ticket type: ${typeLabel}. Each type can only be used once.`;
      }
      usedTypes.add(variant.type);
      
      if (variant.price < 0) {
        const typeLabel = TICKET_TYPES.find(t => t.value === variant.type)?.label || variant.type;
        return `${typeLabel}: Price cannot be negative`;
      }
      if (variant.totalTickets <= 0) {
        const typeLabel = TICKET_TYPES.find(t => t.value === variant.type)?.label || variant.type;
        return `${typeLabel}: Total tickets must be greater than 0`;
      }
      if (variant.totalTickets < (variant.ticketsSold || 0)) {
        const typeLabel = TICKET_TYPES.find(t => t.value === variant.type)?.label || variant.type;
        return `${typeLabel}: Total tickets cannot be less than already sold tickets (${variant.ticketsSold || 0})`;
      }
      if (variant.maxPerUser > variant.totalTickets) {
        const typeLabel = TICKET_TYPES.find(t => t.value === variant.type)?.label || variant.type;
        return `${typeLabel}: Max per user cannot exceed total tickets`;
      }
    }
    return true;
  };

  const onSubmit = async (data: EventUpdateEntity) => {
    if (!event) return;
    
    const startTime = data.startTime;
    const endTime = data.endTime;
    
    if (startTime && endTime) {
      const dateValidation = validateDateTime(startTime, endTime);
      if (dateValidation !== true) {
        toast.error(dateValidation);
        return;
      }
    }
    
    if (useTicketVariants) {
      if (ticketVariants.length === 0) {
        toast.error('At least one ticket variant is required');
        return;
      }
      
      const variantValidation = validateTicketVariants(ticketVariants);
      if (variantValidation !== true) {
        toast.error(variantValidation);
        return;
      }
    } else {
      const soldTickets = event.ticketPurchased || 0;
      const ticketValidation = validateTickets(data.maxTicketsPerUser!, data.totalTicket!, soldTickets);
      if (ticketValidation !== true) {
        toast.error(ticketValidation);
        return;
      }
    }
    
    setIsSubmitting(true);
    try {
      let uploadedImageUrls: string[] = [];
      if (newImages.length > 0) {
        uploadedImageUrls = await uploadImages(newImages);
      }

      const allImages = [...existingImages, ...uploadedImageUrls];

      const updateData: any = { 
        ...data,
        posterImage: allImages
      };

      if (useTicketVariants) {
        updateData.ticketVariants = ticketVariants;
        delete updateData.pricePerTicket;
        delete updateData.totalTicket;
      } else {
        updateData.ticketVariants = [];
      }
      
      if (updateData.location && updateData.location.type === 'Point') {
        if (!updateData.location.coordinates || !Array.isArray(updateData.location.coordinates)) {
          updateData.location = {
            type: 'Point',
            coordinates: [0, 0] 
          };
        }
      }
      
      const response = await updateEventMutation.mutateAsync({
        eventId: event._id,
        update: updateData,
      });
      
      toast.success(response.message || 'Event updated successfully');
      
      const updatedEvent: EventType = {
        ...event,
        ...updateData,
        _id: event._id, 
        
        startTime: updateData.startTime,
        endTime: updateData.endTime,
        date: updateData.date,
        updatedAt: new Date().toISOString(), 
        posterImage: allImages,
        ticketVariants: useTicketVariants ? ticketVariants : [],
        ticketPurchased: event.ticketPurchased
      };
      
      
      if (onEventUpdated) {
        try {
          await onEventUpdated(updatedEvent);
        } catch (error) {
        }
      } else {
      }
      
      setTimeout(() => {
        onClose();
      }, 200);
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

  const getTicketVariantStats = () => {
    if (!useTicketVariants || ticketVariants.length === 0) return null;
    
    const totalQuantity = ticketVariants.reduce((sum, variant) => sum + variant.totalTickets, 0);
    const totalSold = ticketVariants.reduce((sum, variant) => sum + (variant.ticketsSold || 0), 0);
    
    return { totalQuantity, totalSold };
  };

  const getAvailableTicketTypes = (currentIndex: number) => {
    const usedTypes = ticketVariants
      .map((variant, index) => index !== currentIndex ? variant.type : null)
      .filter(Boolean);
    
    return TICKET_TYPES.filter(type => !usedTypes.includes(type.value));
  };

  if (!event) return null;

  const variantStats = getTicketVariantStats();

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
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Ticket Information</h3>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="useTicketVariants"
                  checked={useTicketVariants}
                  onChange={(e) => setUseTicketVariants(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="useTicketVariants" className="text-sm">
                  Use Multiple Ticket Types
                </Label>
              </div>
            </div>

            {!useTicketVariants ? (
              // Single pricing model
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="pricePerTicket">Price per Ticket ($) *</Label>
                    <Input
                      id="pricePerTicket"
                      type="number"
                      step="0.01"
                      min="0"
                      {...register('pricePerTicket', { 
                        required: !useTicketVariants ? 'Price per ticket is required' : false,
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
                        required: !useTicketVariants ? 'Total tickets is required' : false,
                        min: { value: event.ticketPurchased || 1, message: `Cannot be less than already sold tickets (${event.ticketPurchased || 0})` },
                        max: { value: 100000, message: 'Cannot exceed 100,000 tickets' },
                        valueAsNumber: true,
                        validate: (value) => {
                          if (useTicketVariants) return true;
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
              </>
            ) : (
              // Ticket variants model
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Ticket Types</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addTicketVariant}
                    className="flex items-center gap-2"
                    disabled={ticketVariants.length >= TICKET_TYPES.length}
                  >
                    <Plus className="h-4 w-4" />
                    Add Ticket Type
                  </Button>
                </div>

                {ticketVariants.map((variant, index) => {
                  const availableTypes = getAvailableTicketTypes(index);
                  const currentTypeLabel = TICKET_TYPES.find(t => t.value === variant.type)?.label || variant.type;
                  
                  return (
                    <div key={index} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{currentTypeLabel}</h4>
                        {ticketVariants.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeTicketVariant(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                        <div className="space-y-1">
                          <Label>Ticket Type *</Label>
                          <Select
                            value={variant.type}
                            onValueChange={(value) => updateTicketVariant(index, 'type', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select ticket type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={variant.type}>
                                {TICKET_TYPES.find(t => t.value === variant.type)?.label || variant.type}
                              </SelectItem>
                              {availableTypes.map(type => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-1">
                          <Label>Price ($) *</Label>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={variant.price}
                            onChange={(e) => updateTicketVariant(index, 'price', parseFloat(e.target.value) || 0)}
                            placeholder="0.00"
                          />
                        </div>
                        
                        <div className="space-y-1">
                          <Label>Total Tickets *</Label>
                          <Input
                            type="number"
                            min={variant.ticketsSold || 0}
                            value={variant.totalTickets}
                            onChange={(e) => updateTicketVariant(index, 'totalTickets', parseInt(e.target.value) || 0)}
                            placeholder="100"
                          />
                        </div>

                        <div className="space-y-1">
                          <Label>Max per User *</Label>
                          <Input
                            type="number"
                            min="1"
                            max={variant.totalTickets}
                            value={variant.maxPerUser}
                            onChange={(e) => updateTicketVariant(index, 'maxPerUser', parseInt(e.target.value) || 1)}
                            placeholder="2"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Label>Description (Optional)</Label>
                        <Textarea
                          value={variant.description}
                          onChange={(e) => updateTicketVariant(index, 'description', e.target.value)}
                          placeholder="Brief description of this ticket type"
                          rows={2}
                        />
                      </div>
                      
                      {variant.ticketsSold && variant.ticketsSold > 0 && (
                        <div className="text-sm text-muted-foreground bg-muted/50 rounded p-2">
                          <strong>{variant.ticketsSold}</strong> of <strong>{variant.totalTickets}</strong> sold
                          ({variant.totalTickets > 0 ? Math.round((variant.ticketsSold / variant.totalTickets) * 100) : 0}% sold)
                        </div>
                      )}
                    </div>
                  );
                })}

                {variantStats && (
                  <div className="space-y-2">
                    <Label>Total Sales Summary</Label>
                    <div className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
                      <strong>{variantStats.totalSold}</strong> tickets sold out of{' '}
                      <strong>{variantStats.totalQuantity}</strong> total tickets across all variants
                      {variantStats.totalQuantity > 0 && (
                        <span className="ml-2">
                          ({Math.round((variantStats.totalSold / variantStats.totalQuantity) * 100)}% sold)
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
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