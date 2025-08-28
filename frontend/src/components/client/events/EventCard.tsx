// Updated EventCard component with page navigation
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Users, Clock, DollarSign } from 'lucide-react';

interface EventCardProps {
  event: any;
  isSearchResult?: boolean; 
}

export const EventCard = ({ event, isSearchResult = false }: EventCardProps) => {
  
  const navigate = useNavigate();
  
  
  const isLimitedData = isSearchResult && (!event.date || !event.address || !event.category);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Date TBD';
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return 'Time TBD';
    return new Date(timeString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleBookNowClick = () => {
    
    navigate(`/event/${event._id || event.id}`);
  };

  if (isLimitedData) {
    // Render simplified card for search results with limited data
    return (
      <>
        <Card className="group hover:shadow-lg transition-all duration-300 border border-gray-200 hover:border-yellow-primary/30 bg-white">
          <div className="aspect-video relative overflow-hidden rounded-t-lg">
            {event.posterImage && event.posterImage[0] ? (
              <img 
                src={event.posterImage[0]} 
                alt={event.title || 'Event'} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-yellow-100 to-yellow-200 flex items-center justify-center">
                <Calendar className="w-12 h-12 text-yellow-600" />
              </div>
            )}
          </div>
          
          <CardContent className="p-4 space-y-3">
            <div>
              <h3 className="font-semibold text-lg text-gray-900 line-clamp-2 group-hover:text-yellow-primary transition-colors">
                {event.title || 'Event Title'}
              </h3>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-700 text-center">
                Click to view full event details
              </p>
            </div>

            <Button 
              className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-800 font-semibold shadow-md hover:shadow-lg transition-all duration-300"
              onClick={handleBookNowClick}
            >
              View Details
            </Button>
          </CardContent>
        </Card>
      </>
    );
  }

  // Render full card for complete event data
  return (
    <>
      <Card className="group hover:shadow-lg transition-all duration-300 border border-gray-200 hover:border-yellow-primary/30 bg-white">
        <div className="aspect-video relative overflow-hidden rounded-t-lg">
          {event.posterImage && event.posterImage[0] ? (
            <img 
              src={event.posterImage[0]} 
              alt={event.title} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-yellow-100 to-yellow-200 flex items-center justify-center">
              <Calendar className="w-12 h-12 text-yellow-600" />
            </div>
          )}
          
          {event.category && (
            <Badge className="absolute top-3 left-3 bg-white/90 text-gray-800 hover:bg-white">
              {event.category}
            </Badge>
          )}

          {event.pricePerTicket !== undefined && (
            <Badge className="absolute top-3 right-3 bg-green-600 text-white">
              {event.pricePerTicket === 0 ? 'Free' : `₹${event.pricePerTicket}`}
            </Badge>
          )}
        </div>
        
        <CardContent className="p-4 space-y-3">
          <div>
            <h3 className="font-semibold text-lg text-gray-900 line-clamp-2 group-hover:text-yellow-primary transition-colors">
              {event.title}
            </h3>
            {event.description && (
              <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                {event.description}
              </p>
            )}
          </div>

          <div className="space-y-2 text-sm">
            {event.date && event.date[0] && (
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="w-4 h-4 text-yellow-primary" />
                <span>{formatDate(event.date[0])}</span>
              </div>
            )}

            {event.startTime && (
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="w-4 h-4 text-yellow-primary" />
                <span>{formatTime(event.startTime)}</span>
              </div>
            )}

            {event.address && (
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="w-4 h-4 text-yellow-primary" />
                <span className="line-clamp-1">{event.address}</span>
              </div>
            )}

            {event.totalTicket !== undefined && event.ticketPurchased !== undefined && (
              <div className="flex items-center gap-2 text-gray-600">
                <Users className="w-4 h-4 text-yellow-primary" />
                <span>{event.totalTicket - event.ticketPurchased} spots left</span>
              </div>
            )}
          </div>

          <Button 
            className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-800 font-semibold shadow-md hover:shadow-lg transition-all duration-300"
            onClick={handleBookNowClick}
          >
            {event.pricePerTicket === 0 ? 'Register Free' : 'Book Now'}
          </Button>
        </CardContent>
      </Card>
    </>
  );
};