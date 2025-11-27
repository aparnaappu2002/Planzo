import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, Users, Tag, User, DollarSign, Image as ImageIcon } from "lucide-react";

interface EventDetailModalProps {
  event: any | null;
  isOpen: boolean;
  onClose: () => void;
}

export const EventDetailModal = ({ event, isOpen, onClose }: EventDetailModalProps) => {
  if (!event) return null;

  const getStatusColor = (isActive: boolean, status: string) => {
    if (!isActive) {
      return 'bg-destructive text-destructive-foreground';
    }
    switch (status) {
      case 'upcoming':
        return 'bg-gradient-primary text-primary-foreground';
      case 'completed':
        return 'bg-muted text-muted-foreground';
      case 'cancelled':
        return 'bg-destructive text-destructive-foreground';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getEventStatus = (event: any) => {
    if (!event.isActive) return 'cancelled';
    return event.status || 'upcoming';
  };

  const getDisplayStatus = (event: any) => {
    const status = getEventStatus(event);
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const getTotalCapacity = () => {
    if (event.ticketVariants && event.ticketVariants.length > 0) {
      return event.ticketVariants.reduce((sum: number, variant: any) => sum + (variant.quantity || 0), 0);
    }
    return 'Unlimited';
  };

  const getTicketPriceRange = () => {
    if (!event.ticketVariants || event.ticketVariants.length === 0) return null;
    
    const prices = event.ticketVariants
      .map((variant: any) => variant.price)
      .filter((price: any) => price !== undefined && price !== null)
      .sort((a: number, b: number) => a - b);
    
    if (prices.length === 0) return 'Free';
    if (prices.length === 1) return `₹${prices[0]}`;
    return `₹${prices[0]} - ₹${prices[prices.length - 1]}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            {event.title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Event Images */}
          {event.posterImage && event.posterImage.length > 0 && (
            <div className="space-y-4">
              <div className="relative h-64 rounded-lg overflow-hidden shadow-elegant">
                <img 
                  src={event.posterImage[0]} 
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {event.posterImage.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {event.posterImage.slice(1, 5).map((image: string, index: number) => (
                    <div key={index} className="relative h-20 rounded-lg overflow-hidden">
                      <img 
                        src={image} 
                        alt={`${event.title} ${index + 2}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Event Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-4 rounded-lg bg-secondary/50 hover:bg-secondary/70 transition-colors">
              <Calendar className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Event Date</p>
                <p className="text-sm text-muted-foreground">
                  {event.date && event.date.length > 0 
                    ? formatDate(event.date[0]) 
                    : formatDate(event.startTime)
                  }
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-lg bg-secondary/50 hover:bg-secondary/70 transition-colors">
              <Clock className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Time</p>
                <p className="text-sm text-muted-foreground">
                  {formatTime(event.startTime)} - {formatTime(event.endTime)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-lg bg-secondary/50 hover:bg-secondary/70 transition-colors">
              <MapPin className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Venue</p>
                <p className="text-sm text-muted-foreground font-medium">{event.venueName}</p>
                <p className="text-xs text-muted-foreground">{event.address}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-lg bg-secondary/50 hover:bg-secondary/70 transition-colors">
              <Users className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Attendance</p>
                <p className="text-sm text-muted-foreground">
                  {event.attendeesCount || 0} registered
                  {getTotalCapacity() !== 'Unlimited' && ` / ${getTotalCapacity()} capacity`}
                </p>
              </div>
            </div>

            {getTicketPriceRange() && (
              <div className="flex items-center gap-3 p-4 rounded-lg bg-secondary/50 hover:bg-secondary/70 transition-colors">
                <DollarSign className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">Ticket Price</p>
                  <p className="text-sm text-muted-foreground">{getTicketPriceRange()}</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 p-4 rounded-lg bg-secondary/50 hover:bg-secondary/70 transition-colors">
              <User className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Hosted By</p>
                <p className="text-sm text-muted-foreground">{event.hostedBy}</p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">About This Event</h3>
            <p className="text-muted-foreground leading-relaxed">
              {event.description || "No description available for this event."}
            </p>
          </div>

          {/* Ticket Variants */}
          {event.ticketVariants && event.ticketVariants.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Ticket Options</h3>
              <div className="grid gap-3">
                {event.ticketVariants.map((variant: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                    <div>
                      <p className="font-medium">{variant.name || `Ticket Type ${index + 1}`}</p>
                      {variant.description && (
                        <p className="text-sm text-muted-foreground">{variant.description}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        {variant.price ? `₹${variant.price}` : 'Free'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {variant.totalTickets ? `${variant.totalTickets} available` : 'Unlimited'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Status and Category Badges */}
          <div className="flex flex-wrap gap-2">
            <Badge className={getStatusColor(event.isActive, event.status)}>
              {getDisplayStatus(event)}
            </Badge>
            <Badge variant="secondary">
              <Tag className="h-3 w-3 mr-1" />
              {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
            </Badge>
            <Badge variant="outline">
              ID: {event._id.slice(-8)}
            </Badge>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button 
              onClick={onClose}
              variant="outline"
              className="flex-1"
            >
              Close
            </Button>
            
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};