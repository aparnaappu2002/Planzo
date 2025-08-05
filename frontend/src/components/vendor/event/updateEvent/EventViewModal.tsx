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
  DollarSign,IndianRupee ,
  Clock, 
  Tag,
  Image as ImageIcon,
  TrendingUp
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
    switch (status) {
      case 'upcoming':
        return 'bg-primary text-primary-foreground';
      case 'completed':
        return 'bg-success text-success-foreground';
      case 'cancelled':
        return 'bg-destructive text-destructive-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const ticketsSoldPercentage = (event.ticketPurchased / event.totalTicket) * 100;
  const revenue = event.ticketPurchased * event.pricePerTicket;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-3">
            {event.title}
            <Badge className={getStatusColor(event.status)}>
              {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
            </Badge>
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
                  <div key={index} className="relative aspect-video rounded-lg overflow-hidden">
                    <img
                      src={image}
                      alt={`${event.title} - Image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div className="space-y-3">
            <h3 className="font-semibold">Description</h3>
            <p className="text-muted-foreground leading-relaxed">{event.description}</p>
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
                  <span className="text-muted-foreground">Category:</span>
                  <Badge variant="secondary">{event.category}</Badge>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created:</span>
                  <span className="font-medium">
                    {format(new Date(event.createdAt), 'MMM dd, yyyy')}
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
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Coordinates:</span>
                  <span className="font-medium">
                    {event.location.coordinates[1].toFixed(4)}, {event.location.coordinates[0].toFixed(4)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Sales & Revenue
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-accent/20 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <IndianRupee className="h-5 w-5 text-primary" />
                </div>
                <div className="text-2xl font-bold text-primary">
                  ₹{event.pricePerTicket}
                </div>
                <div className="text-sm text-muted-foreground">Price per Ticket</div>
              </div>
              
              <div className="bg-accent/20 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Users className="h-5 w-5 text-success" />
                </div>
                <div className="text-2xl font-bold text-success">
                  {event.ticketPurchased}
                </div>
                <div className="text-sm text-muted-foreground">Tickets Sold</div>
              </div>
              
              <div className="bg-accent/20 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Tag className="h-5 w-5 text-warning" />
                </div>
                <div className="text-2xl font-bold text-warning">
                  {event.totalTicket}
                </div>
                <div className="text-sm text-muted-foreground">Total Tickets</div>
              </div>
              
              <div className="bg-accent/20 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <IndianRupee className="h-5 w-5 text-primary" />
                </div>
                <div className="text-2xl font-bold text-primary">
                  ₹{revenue.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Total Revenue</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Sales Progress</span>
                <span className="font-medium">{ticketsSoldPercentage.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-3">
                <div
                  className="h-3 rounded-full bg-gradient-to-r from-primary to-primary-glow transition-all duration-300"
                  style={{ width: `${Math.min(ticketsSoldPercentage, 100)}%` }}
                />
              </div>
            </div>

            {/* Additional Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Max tickets per user:</span>
                <span className="font-medium">{event.maxTicketsPerUser}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Remaining tickets:</span>
                <span className="font-medium">{event.totalTicket - event.ticketPurchased}</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};