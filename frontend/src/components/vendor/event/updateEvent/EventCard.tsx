import { EventType } from '@/types/EventType';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarDays, MapPin, Users, DollarSign,IndianRupeeIcon, Eye, Edit } from 'lucide-react';
import { format } from 'date-fns';

interface EventCardProps {
  event: EventType;
  onView: (event: Event) => void;
  onEdit: (event: Event) => void;
}

export const EventCard = ({ event, onView, onEdit }: EventCardProps) => {
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

  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-gradient-to-br from-card to-accent/10">
      <div className="relative h-48 overflow-hidden">
        <img
          src={event.posterImage[0] || '/placeholder.svg'}
          alt={event.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute top-4 left-4">
          <Badge className={getStatusColor(event.status)}>
            {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
          </Badge>
        </div>
        <div className="absolute top-4 right-4">
          <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
            {event.category}
          </Badge>
        </div>
      </div>
      
      <CardContent className="p-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-semibold text-foreground mb-2 line-clamp-1">
              {event.title}
            </h3>
            <p className="text-muted-foreground text-sm line-clamp-2">
              {event.description}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarDays className="h-4 w-4" />
              <span>{format(new Date(event.startTime), 'MMM dd, yyyy • h:mm a')}</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span className="line-clamp-1">{event.venueName || event.address}</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <IndianRupeeIcon className="h-4 w-4" />
              <span>₹{event.pricePerTicket}</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{event.ticketPurchased} / {event.totalTicket} tickets sold</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Sales Progress</span>
              <span className="font-medium">{ticketsSoldPercentage.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-primary to-primary-glow transition-all duration-300"
                style={{ width: `${Math.min(ticketsSoldPercentage, 100)}%` }}
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onView(event)}
              className="flex-1 group/btn"
            >
              <Eye className="h-4 w-4 mr-2 transition-transform group-hover/btn:scale-110" />
              View Details
            </Button>
            <Button
              size="sm"
              onClick={() => onEdit(event)}
              className="flex-1 group/btn"
            >
              <Edit className="h-4 w-4 mr-2 transition-transform group-hover/btn:scale-110" />
              Edit Event
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};