import { Calendar, Clock, MapPin, Users, Star,IndianRupee } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { toast } from 'react-toastify';
interface EventCardProps {
  event: any; // Changed from EventType to any since the structure doesn't match
  featured?: boolean;
}

export const EventCard = ({ event, featured = false }: EventCardProps) => {
  
  const navigate = useNavigate();
  const [isNavigating, setIsNavigating] = useState(false);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Date TBA';
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return 'Time TBA';
    // Handle different time formats
    if (timeString.includes('T')) {
      return new Date(timeString).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    }
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };



  const getAttendancePercentage = () => {
    if (!event.maxAttendees || !event.attendees) return 0;
    const currentAttendees = Array.isArray(event.attendees) ? event.attendees.length : event.attendees;
    return Math.round((currentAttendees / event.maxAttendees) * 100);
  };

  const handleViewDetails = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      setIsNavigating(true);
      const eventId = event._id || event.id;
      
      if (!eventId) {
        console.error('Event ID not found in event object:', event);
        return;
      }
      
      navigate(`/event/${eventId.trim()}`);
      
    } catch (error) {
      console.error('Error navigating to event details:', error);
      toast.error('An error occurred while trying to view event details. Please try again.');
    } finally {
      setTimeout(() => setIsNavigating(false), 500);
    }
  };


  // Extract location from nested object or use address
  const getLocation = () => {
    if (event.location?.address) return event.location.address;
    if (event.address) return event.address;
    return 'Location TBA';
  };

  return (
    <Card 
      className={`group cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-event ${
        featured 
          ? 'bg-event-featured border-accent shadow-featured' 
          : 'bg-event-card hover:bg-event-hover'
      }`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className="text-xs font-medium capitalize">
                {event.category || 'General'}
              </Badge>
              {featured && (
                <Star className="w-4 h-4 fill-accent text-accent-foreground" />
              )}
            </div>
            <h3 className="font-bold text-lg leading-tight text-foreground group-hover:text-accent-foreground transition-colors">
              {event.title || event.name || 'Event Title'}
            </h3>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-muted-foreground text-sm line-clamp-2">
          {event.description || 'No description available'}
        </p>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(event.date || event.startDate)}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>{formatTime(event.time || event.startTime)}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground col-span-2">
            <MapPin className="w-4 h-4" />
            <span className="truncate">{getLocation()}</span>
          </div>
        </div>

        {event.maxAttendees && event.attendees && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="w-4 h-4" />
            <span>
              {Array.isArray(event.attendees) ? event.attendees.length : event.attendees}
              /{event.maxAttendees} attending
            </span>
            <div className="flex-1 bg-muted rounded-full h-2 ml-2">
              <div 
                className="bg-accent h-2 rounded-full transition-all duration-300"
                style={{ width: `${getAttendancePercentage()}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-1">
            {event.pricePerTicket ? (
              <>
                <IndianRupee className="w-4 h-4 text-accent" />
                <span className="font-semibold text-foreground">
                  ₹{event.pricePerTicket}
                </span>
              </>
            ) : (
              <span className="font-semibold text-accent">Free</span>
            )}
          </div>
         <Button 
            size="sm" 
            className="bg-gradient-primary hover:opacity-90 transition-opacity disabled:opacity-50"
            onClick={handleViewDetails}
            disabled={isNavigating}
          >
            {isNavigating ? 'Loading...' : 'View Details'}
          </Button>

        </div>

        <div className="text-xs text-muted-foreground pt-1 border-t border-border">
          Organized by {event.organizer || event.organizerName || 'Unknown Organizer'}
        </div>
      </CardContent>
    </Card>
  );
};