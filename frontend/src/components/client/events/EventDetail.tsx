import { useParams, useNavigate } from "react-router-dom";
import { useFindEventById } from "@/hooks/clientCustomHooks";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Star, 
  ArrowLeft,
  Ticket,
  Heart,
  Share2,
  IndianRupee,
  Timer,
  Building2,
  User,
  ShoppingCart,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { useState } from "react";
import TicketPurchaseModal from "../payment/TicketPurchase";

const EventDetail = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { data: responseData, isLoading, error } = useFindEventById(eventId || "");
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const event = responseData?.event || responseData;
  console.log(event);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <div className="animate-spin w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full"></div>
          <span className="text-yellow-700">Loading event details...</span>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center p-8">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-red-600 mb-2">Event Not Found</h2>
            <p className="text-gray-600 mb-4">
              Sorry, we couldn't find the event you're looking for.
            </p>
            <Button onClick={() => navigate(-1)} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Helper functions
  const formatDate = (dateString: string | string[]) => {
    if (!dateString) return 'Date TBA';
    const date = Array.isArray(dateString) ? dateString[0] : dateString;
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return 'Time TBA';
    return new Date(timeString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDateTime = (timeString: string) => {
    if (!timeString) return 'TBA';
    const date = new Date(timeString);
    return `${date.toLocaleDateString()} at ${date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })}`;
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'ongoing': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const availableTickets = event.totalTicket - event.ticketPurchased;
  const ticketsSoldPercentage = event.totalTicket > 0 ? (event.ticketPurchased / event.totalTicket) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50">
      {/* Hero Section */}
      <div className="relative h-96 bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 overflow-hidden">
        <div className="absolute inset-0 bg-black/30"></div>
        {event.posterImage && event.posterImage[0] && (
          <img 
            src={event.posterImage[0]} 
            alt={event.title || 'Event Poster'}
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute top-6 left-6">
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={() => navigate(-1)}
            className="bg-white/90 backdrop-blur-sm hover:bg-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>
        <div className="absolute top-6 right-6 flex gap-2">
          <Button size="sm" variant="secondary" className="bg-white/90 backdrop-blur-sm hover:bg-white">
            <Heart className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="secondary" className="bg-white/90 backdrop-blur-sm hover:bg-white">
            <Share2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 -mt-24 relative z-10 pb-12">
        {/* Main Event Card */}
        <Card className="shadow-xl border-2 border-yellow-200 bg-white">
          <CardHeader className="pb-4">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 capitalize">
                {event.category}
              </Badge>
              <Badge className={getStatusColor(event.status)} variant="secondary">
                {event.status}
              </Badge>
              {event.isActive && (
                <Badge className="bg-green-100 text-green-800" variant="secondary">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Active
                </Badge>
              )}
            </div>
            <CardTitle className="text-3xl lg:text-4xl font-bold text-gray-900">
              {event.title}
            </CardTitle>
            <p className="text-lg text-gray-600 mt-2">
              {event.description}
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Key Info Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center gap-3 p-4 rounded-lg bg-yellow-50">
                <Calendar className="w-5 h-5 text-yellow-600" />
                <div>
                  <p className="text-sm font-medium">Event Date</p>
                  <p className="text-sm text-gray-600">
                    {formatDate(event.date)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 rounded-lg bg-blue-50">
                <Clock className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium">Start Time</p>
                  <p className="text-sm text-gray-600">
                    {formatTime(event.startTime)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 rounded-lg bg-green-50">
                <MapPin className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium">Venue</p>
                  <p className="text-sm text-gray-600">{event.venueName}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 rounded-lg bg-purple-50">
                <IndianRupee className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-sm font-medium">Price</p>
                  <p className="text-sm text-gray-600">
                    {event.pricePerTicket ? `₹${event.pricePerTicket}` : 'Free'}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Detailed Information Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Time Details */}
              <Card className="bg-gray-50">
                <CardHeader className="pb-3">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Timer className="w-5 h-5 text-orange-600" />
                    Event Timeline
                  </h3>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Start Time:</span>
                    <span className="text-sm font-medium">{formatDateTime(event.startTime)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">End Time:</span>
                    <span className="text-sm font-medium">{formatDateTime(event.endTime)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Created:</span>
                    <span className="text-sm font-medium">{formatDateTime(event.createdAt)}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Ticket Information */}
              <Card className="bg-gray-50">
                <CardHeader className="pb-3">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Ticket className="w-5 h-5 text-blue-600" />
                    Ticket Information
                  </h3>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Tickets:</span>
                    <span className="text-sm font-medium">{event.totalTicket}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Sold:</span>
                    <span className="text-sm font-medium text-green-600">{event.ticketPurchased}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Available:</span>
                    <span className="text-sm font-medium text-blue-600">{availableTickets}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Max per user:</span>
                    <span className="text-sm font-medium">{event.maxTicketsPerUser}</span>
                  </div>
                  {/* Progress Bar */}
                  <div className="mt-2">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Tickets Sold</span>
                      <span>{Math.round(ticketsSoldPercentage)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${ticketsSoldPercentage}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Separator />

            {/* Location Details */}
            <Card className="bg-yellow-50">
              <CardHeader className="pb-3">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-yellow-600" />
                  Location Details
                </h3>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Venue Name</p>
                    <p className="text-gray-900">{event.venueName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Address</p>
                    <p className="text-gray-900">{event.address}</p>
                  </div>
                  {event.location?.coordinates && (
                    <div className="md:col-span-2">
                      <p className="text-sm font-medium text-gray-700 mb-1">Coordinates</p>
                      <p className="text-gray-900 text-sm">
                        Lat: {event.location.coordinates[1]}, Lng: {event.location.coordinates[0]}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Separator />

            {/* Attendees Information */}
            <Card className="bg-blue-50">
              <CardHeader className="pb-3">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  Attendees Information
                </h3>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{event.attendeesCount}</p>
                    <p className="text-sm text-gray-600">Current Attendees</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{event.ticketPurchased}</p>
                    <p className="text-sm text-gray-600">Tickets Purchased</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">{availableTickets}</p>
                    <p className="text-sm text-gray-600">Spots Available</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <Button 
                size="lg" 
                className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white shadow-lg transition-all duration-300"
                disabled={availableTickets === 0 || !event.isActive}
                onClick={() => setIsModalOpen(true)}
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                {availableTickets === 0 ? 'Sold Out' : 
                 event.pricePerTicket ? `Buy Tickets - ₹${event.pricePerTicket}` : 'Get Free Tickets'}
              </Button>
              <Button variant="outline" size="lg" className="flex-1 border-yellow-300 text-yellow-700 hover:bg-yellow-50">
                <User className="w-5 h-5 mr-2" />
                Contact Organizer
              </Button>
            </div>

            {/* Event ID for Reference */}
            <div className="text-center text-xs text-gray-400 pt-4">
              Event ID: {event._id}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ticket Purchase Modal */}
      <TicketPurchaseModal 
        event={event}
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </div>
  );
};

export default EventDetail;