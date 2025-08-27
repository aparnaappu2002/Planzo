import { EventType } from '@/types/EventType';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  CalendarDays, 
  MapPin, 
  Users, 
  DollarSign,
  IndianRupee,
  Clock, 
  Tag,
  Image as ImageIcon,
  TrendingUp,
  Ticket
} from 'lucide-react';
import { format } from 'date-fns';

interface EventViewModalProps {
  event: EventType | null;
  isOpen: boolean;
  onClose: () => void;
}

export const EventViewModal = ({ event, isOpen, onClose }: EventViewModalProps) => {
  
  if (!event) return null;

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'upcoming':
        return 'bg-blue-500 text-white';
      case 'completed':
        return 'bg-green-500 text-white';
      case 'cancelled':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'music':
        return 'bg-purple-100 text-purple-800';
      case 'entertainment':
        return 'bg-pink-100 text-pink-800';
      case 'workshop':
        return 'bg-blue-100 text-blue-800';
      case 'seminar':
        return 'bg-green-100 text-green-800';
      case 'conference':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Handle ticket calculations - some events might have ticketVariants instead of simple pricing
  const hasTicketVariants = event.ticketVariants && event.ticketVariants.length > 0;
  const ticketsSold = event.ticketPurchased || 0;
  const totalTickets = event.totalTicket || 0;
  const ticketsSoldPercentage = totalTickets > 0 ? (ticketsSold / totalTickets) * 100 : 0;
  
  // Calculate revenue based on ticket variants or simple pricing
  let totalRevenue = 0;
  if (hasTicketVariants) {
    totalRevenue = event.ticketVariants.reduce((sum: number, variant: any) => {
      return sum + ((variant.sold || 0) * (variant.price || 0));
    }, 0);
  } else {
    totalRevenue = ticketsSold * (event.pricePerTicket || 0);
  }

  // Get price range for display
  const getPriceDisplay = () => {
    if (hasTicketVariants) {
      const prices = event.ticketVariants.map((v: any) => v.price || 0);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      
      if (minPrice === maxPrice) {
        return minPrice === 0 ? 'Free' : `₹${minPrice}`;
      }
      return minPrice === 0 ? `Free - ₹${maxPrice}` : `₹${minPrice} - ₹${maxPrice}`;
    }
    return (event.pricePerTicket || 0) === 0 ? 'Free' : `₹${event.pricePerTicket}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-3 flex-wrap">
            {event.title}
            <div className="flex gap-2 flex-wrap">
              <Badge className={getStatusColor(event.status)}>
                {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
              </Badge>
              <Badge className={getCategoryColor(event.category)} variant="secondary">
                {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
              </Badge>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Event Images */}
          {event.posterImage && event.posterImage.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                <h3 className="font-semibold">Event Images</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {event.posterImage.map((image, index) => (
                  <div key={index} className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={image}
                      alt={`${event.title} - Image ${index + 1}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder-event.jpg';
                        e.currentTarget.onerror = null;
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div className="space-y-3">
            <h3 className="font-semibold">Description</h3>
            <p className="text-muted-foreground leading-relaxed">
              {event.description || 'No description provided.'}
            </p>
          </div>

          <Separator />

          {/* Event Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <CalendarDays className="h-5 w-5" />
                Event Details
              </h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Start Date & Time:</span>
                  <span className="font-medium">
                    {format(new Date(event.startTime), 'MMM dd, yyyy • h:mm a')}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">End Date & Time:</span>
                  <span className="font-medium">
                    {format(new Date(event.endTime), 'MMM dd, yyyy • h:mm a')}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duration:</span>
                  <span className="font-medium">
                    {(() => {
                      const start = new Date(event.startTime);
                      const end = new Date(event.endTime);
                      const diffHours = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60));
                      return diffHours > 24 ? `${Math.floor(diffHours / 24)} days` : `${diffHours} hours`;
                    })()}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created:</span>
                  <span className="font-medium">
                    {format(new Date(event.createdAt), 'MMM dd, yyyy')}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Event Status:</span>
                  <span className="font-medium">
                    {event.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Location Details
              </h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Venue:</span>
                  <span className="font-medium">{event.venueName || 'N/A'}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Address:</span>
                  <span className="font-medium text-right max-w-48">
                    {event.address || 'N/A'}
                  </span>
                </div>
                
                {event.location?.coordinates && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Coordinates:</span>
                    <span className="font-medium">
                      {event.location.coordinates[1]?.toFixed(4)}, {event.location.coordinates[0]?.toFixed(4)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Attendees Count:</span>
                  <span className="font-medium">{event.attendeesCount || 0}</span>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Ticket Information */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Ticket className="h-5 w-5" />
              Ticket Information
            </h3>
            
            {hasTicketVariants ? (
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  This event has multiple ticket types:
                </div>
                <div className="grid gap-3">
                  {event.ticketVariants.map((variant: any, index: number) => (
                    <div key={index} className="bg-accent/20 rounded-lg p-4 flex justify-between items-center">
                      <div>
                        <div className="font-medium">{variant.name || `Ticket Type ${index + 1}`}</div>
                        <div className="text-sm text-muted-foreground">
                          {variant.description || 'No description'}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-primary">
                          {variant.price === 0 ? 'Free' : `₹${variant.price}`}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {variant.sold || 0} / {variant.quantity || 0} sold
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-accent/20 rounded-lg p-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <IndianRupee className="h-5 w-5 text-primary" />
                  </div>
                  <div className="text-2xl font-bold text-primary">
                    {getPriceDisplay()}
                  </div>
                  <div className="text-sm text-muted-foreground">Ticket Price</div>
                </div>
                
                <div className="bg-accent/20 rounded-lg p-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Users className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="text-2xl font-bold text-green-600">
                    {ticketsSold}
                  </div>
                  <div className="text-sm text-muted-foreground">Tickets Sold</div>
                </div>
                
                <div className="bg-accent/20 rounded-lg p-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Tag className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold text-blue-600">
                    {totalTickets}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Tickets</div>
                </div>
                
                <div className="bg-accent/20 rounded-lg p-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <IndianRupee className="h-5 w-5 text-primary" />
                  </div>
                  <div className="text-2xl font-bold text-primary">
                    ₹{totalRevenue.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Revenue</div>
                </div>
              </div>
            )}

            {/* Progress Bar */}
            {totalTickets > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Sales Progress</span>
                  <span className="font-medium">{ticketsSoldPercentage.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-3">
                  <div
                    className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300"
                    style={{ width: `${Math.min(ticketsSoldPercentage, 100)}%` }}
                  />
                </div>
              </div>
            )}

            {/* Additional Ticket Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              
              {totalTickets > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Remaining tickets:</span>
                  <span className="font-medium">{totalTickets - ticketsSold}</span>
                </div>
              )}
            </div>
          </div>

          {/* Event Dates Array (if multiple dates) */}
          {event.date && event.date.length > 1 && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <CalendarDays className="h-5 w-5" />
                  Event Dates
                </h3>
                <div className="grid gap-2">
                  {event.date.map((dateStr: string, index: number) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-accent/10 rounded">
                      <span className="text-sm text-muted-foreground">Date {index + 1}:</span>
                      <span className="font-medium">{format(new Date(dateStr), 'MMM dd, yyyy')}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};