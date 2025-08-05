import { useState } from "react";
import { useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar, MapPin, Clock, Users, DollarSign,IndianRupee, Image as ImageIcon, Tag } from "lucide-react";
import { EventType } from "@/types/EventType";
import { RootState } from "@/redux/Store";
import { toast } from "react-toastify";
import LocationSection from "./LocationSection";
import { useCreateEvent } from "@/hooks/vendorCustomHooks";
import { useUploadImageMutation } from "@/hooks/vendorCustomHooks";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

// Define validation schema
const eventSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  venueName: z.string().min(3, "Venue name must be at least 3 characters").optional(),
  address: z.string().min(5, "Address must be at least 5 characters").optional(),
  category: z.string().min(1, "Category is required"),
  hostedBy: z.string().min(3, "Host name must be at least 3 characters").optional(),
  pricePerTicket: z.number().min(0, "Price cannot be negative"),
  maxTicketsPerUser: z.number().min(1, "Minimum 1 ticket per user"),
  totalTicket: z.number().min(1, "Minimum 1 ticket required"),
});

export const EventCreation = () => {
  const { register, handleSubmit, formState: { errors }, setValue, trigger } = useForm({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: "",
      description: "",
      address: "",
      venueName: "",
      category: "",
      hostedBy: "",
      pricePerTicket: 0,
      maxTicketsPerUser: 1,
      totalTicket: 100,
    }
  });

  const [eventDate, setEventDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [longitude, setLongitude] = useState(0);
  const [latitude, setLatitude] = useState(0);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [posterImages, setPosterImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  
  const vendorId = useSelector((state: RootState) => state.vendorSlice.vendor?._id);

  
  const createEventMutation = useCreateEvent();
  const uploadImageMutation = useUploadImageMutation();

  const handleInputChange = (field: keyof EventType, value: any) => {
    setValue(field, value);
    trigger(field);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    
    const files = Array.from(e.target.files);
    const newPreviewUrls: string[] = [];
    
   
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

    setPosterImages(prev => [...prev, ...validFiles]);
  };

  const removeImage = (index: number) => {
    setPosterImages(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
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

  const onSubmit = async (data: any) => {
    
    if (!eventDate) {
      toast.error("Event date is required");
      return;
    }
    
    if (!startTime || !endTime) {
      toast.error("Start and end times are required");
      return;
    }
    
    if (latitude === 0 || longitude === 0) {
      toast.error("Please select a valid location on the map");
      return;
    }
    
    if (!vendorId) {
      toast.error("Vendor ID is required");
      return;
    }

    try {
      
      let uploadedImageUrls: string[] = [];
      if (posterImages.length > 0) {
        uploadedImageUrls = await uploadImages(posterImages);
      }

     
      const eventDateTime = new Date(`${eventDate}T${startTime}`);
      const eventEndTime = new Date(`${eventDate}T${endTime}`);

      if (eventEndTime <= eventDateTime) {
        toast.error("End time must be after start time");
        return;
      }

      const finalEventData: EventType = {
        ...data,
        startTime: eventDateTime,
        endTime: eventEndTime,
        date: [eventDateTime],
        createdAt: new Date(),
        ticketPurchased: 0,
        posterImage: uploadedImageUrls,
        status: "upcoming",
        location: {
          type: "Point",
          coordinates: [longitude, latitude]
        }
      } as EventType;

     
      const response = await createEventMutation.mutateAsync({
        event: finalEventData,
        vendorId: vendorId
      });

      toast.success(response.message);

      
      resetForm();

    } catch (error: any) {
      console.error("Event creation failed:", error);
      toast.error(error.message || "Failed to create event");
    }
  };

  const resetForm = () => {
    setValue("title", "");
    setValue("description", "");
    setValue("address", "");
    setValue("venueName", "");
    setValue("category", "");
    setValue("hostedBy", "");
    setValue("pricePerTicket", 0);
    setValue("maxTicketsPerUser", 1);
    setValue("totalTicket", 100);
    setEventDate("");
    setStartTime("");
    setEndTime("");
    setLongitude(0);
    setLatitude(0);
    setPosterImages([]);
    setPreviewUrls([]);
  };

  const isLoading = createEventMutation.isPending || uploadImageMutation.isPending;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-yellow-50 to-yellow-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-yellow-600 bg-clip-text text-transparent mb-3">
            Create Your Event
          </h1>
          <p className="text-muted-foreground text-lg">
            Bring your vision to life with our beautiful event creation platform
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Card className="shadow-elegant border-0 bg-card/80 backdrop-blur-sm">
            <CardHeader className="text-center border-b border-border/50">
              <CardTitle className="text-2xl text-primary">Event Details</CardTitle>
              <CardDescription>Fill in the information about your event</CardDescription>
            </CardHeader>
            
            <CardContent className="p-8 space-y-8">
              {/* Basic Information */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-medium flex items-center gap-2">
                    <Tag className="w-4 h-4 text-primary" />
                    Event Title *
                  </Label>
                  <Input
                    id="title"
                    placeholder="Enter event title"
                    {...register("title")}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="border-border/60 focus:border-primary transition-colors"
                    disabled={isLoading}
                  />
                  {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category" className="text-sm font-medium">
                    Category *
                  </Label>
                  <Select 
                    onValueChange={(value) => handleInputChange('category', value)}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="conference">Conference</SelectItem>
                      <SelectItem value="workshop">Workshop</SelectItem>
                      <SelectItem value="seminar">Seminar</SelectItem>
                      <SelectItem value="networking">Networking</SelectItem>
                      <SelectItem value="entertainment">Entertainment</SelectItem>
                      <SelectItem value="sports">Sports</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.category && <p className="text-sm text-red-500">{errors.category.message}</p>}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">
                  Description *
                </Label>
                <Textarea
                  id="description"
                  placeholder="Describe your event..."
                  {...register("description")}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="min-h-[120px] border-border/60 focus:border-primary resize-none"
                  disabled={isLoading}
                />
                {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
              </div>

              {/* Location Information */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="venueName" className="text-sm font-medium flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    Venue Name
                  </Label>
                  <Input
                    id="venueName"
                    placeholder="Enter venue name"
                    {...register("venueName")}
                    onChange={(e) => handleInputChange('venueName', e.target.value)}
                    className="border-border/60 focus:border-primary"
                    disabled={isLoading}
                  />
                  {errors.venueName && <p className="text-sm text-red-500">{errors.venueName.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address" className="text-sm font-medium">
                    Address
                  </Label>
                  <Input
                    id="address"
                    placeholder="Enter address"
                    {...register("address")}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="border-border/60 focus:border-primary"
                    disabled={isLoading}
                  />
                  {errors.address && <p className="text-sm text-red-500">{errors.address.message}</p>}
                </div>
              </div>

              {/* Location Selection with Modals */}
              <div className="space-y-4">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  Event Location *
                </Label>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <Dialog open={isLocationModalOpen} onOpenChange={setIsLocationModalOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="w-full border-border/60 hover:border-primary"
                        disabled={isLoading}
                      >
                        <MapPin className="w-4 h-4 mr-2" />
                        Select Location on Map
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl">
                      <DialogHeader>
                        <DialogTitle>Select Event Location</DialogTitle>
                      </DialogHeader>
                      <div className="mt-4">
                        <LocationSection setLatitude={setLatitude} setLongitude={setLongitude} />
                      </div>
                      <Button 
                        onClick={() => setIsLocationModalOpen(false)}
                        className="mt-4"
                      >
                        Confirm Location
                      </Button>
                    </DialogContent>
                  </Dialog>

                  <div className="flex items-center justify-center p-4 bg-muted/50 rounded-lg border border-border/60">
                    <span className="text-sm text-muted-foreground">
                      {latitude !== 0 && longitude !== 0 
                        ? `Selected: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
                        : "No location selected"
                      }
                    </span>
                  </div>
                </div>
                {(latitude === 0 || longitude === 0) && (
                  <p className="text-sm text-red-500">Please select a location on the map</p>
                )}
              </div>

              {/* Date and Time */}
              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="date" className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    Event Date *
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="border-border/60 focus:border-primary"
                    disabled={isLoading}
                    min={new Date().toISOString().split('T')[0]}
                  />
                  {!eventDate && <p className="text-sm text-red-500">Event date is required</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="startTime" className="text-sm font-medium flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" />
                    Start Time *
                  </Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="border-border/60 focus:border-primary"
                    disabled={isLoading}
                  />
                  {!startTime && <p className="text-sm text-red-500">Start time is required</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endTime" className="text-sm font-medium">
                    End Time *
                  </Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="border-border/60 focus:border-primary"
                    disabled={isLoading}
                  />
                  {!endTime && <p className="text-sm text-red-500">End time is required</p>}
                </div>
              </div>

              {/* Ticket Information */}
              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="price" className="text-sm font-medium flex items-center gap-2">
                    <IndianRupee className="w-4 h-4 text-primary" />
                    Price per Ticket
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    {...register("pricePerTicket", { valueAsNumber: true })}
                    onChange={(e) => handleInputChange('pricePerTicket', parseFloat(e.target.value) || 0)}
                    className="border-border/60 focus:border-primary"
                    disabled={isLoading}
                  />
                  {errors.pricePerTicket && <p className="text-sm text-red-500">{errors.pricePerTicket.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="totalTickets" className="text-sm font-medium flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary" />
                    Total Tickets *
                  </Label>
                  <Input
                    id="totalTickets"
                    type="number"
                    min="1"
                    {...register("totalTicket", { valueAsNumber: true })}
                    onChange={(e) => handleInputChange('totalTicket', parseInt(e.target.value) || 100)}
                    className="border-border/60 focus:border-primary"
                    disabled={isLoading}
                  />
                  {errors.totalTicket && <p className="text-sm text-red-500">{errors.totalTicket.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxPerUser" className="text-sm font-medium">
                    Max Tickets per User *
                  </Label>
                  <Input
                    id="maxPerUser"
                    type="number"
                    min="1"
                    {...register("maxTicketsPerUser", { valueAsNumber: true })}
                    onChange={(e) => handleInputChange('maxTicketsPerUser', parseInt(e.target.value) || 1)}
                    className="border-border/60 focus:border-primary"
                    disabled={isLoading}
                  />
                  {errors.maxTicketsPerUser && <p className="text-sm text-red-500">{errors.maxTicketsPerUser.message}</p>}
                </div>
              </div>

              {/* Host Information */}
              <div className="space-y-2">
                <Label htmlFor="hostedBy" className="text-sm font-medium">
                  Hosted By
                </Label>
                <Input
                  id="hostedBy"
                  placeholder="Organization or person hosting the event"
                  {...register("hostedBy")}
                  onChange={(e) => handleInputChange('hostedBy', e.target.value)}
                  className="border-border/60 focus:border-primary"
                  disabled={isLoading}
                />
                {errors.hostedBy && <p className="text-sm text-red-500">{errors.hostedBy.message}</p>}
              </div>

              {/* Image Upload */}
              <div className="space-y-4">
                <Label htmlFor="posterImage" className="text-sm font-medium flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-primary" />
                  Poster Images
                </Label>
                <Input
                  id="posterImage"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="border-border/60 focus:border-primary file:bg-secondary file:border-0 file:text-secondary-foreground"
                  disabled={isLoading}
                />
                
                {/* Image previews */}
                {previewUrls.length > 0 && (
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    {previewUrls.map((url, index) => (
                      <div key={index} className="relative group">
                        <img 
                          src={url} 
                          alt={`Preview ${index}`} 
                          className="w-full h-32 object-cover rounded-lg border border-border/60"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-6 border-t border-border/50">
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-primary to-yellow-500 hover:from-yellow-500 hover:to-primary text-primary-foreground font-semibold py-6 text-lg shadow-glow transition-all duration-300 transform hover:scale-[1.02]"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating Event..." : "Create Event"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
};