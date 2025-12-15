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
  AlertCircle,
  Crown,
  Gem,
  Shield
} from "lucide-react";
import { useState } from "react";
import TicketPurchaseModal from "../payment/TicketPurchase";

const EventDetail = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { data: responseData, isLoading, error } = useFindEventById(eventId || "");
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Try different ways to access event data
  const event = responseData?.event || responseData?.data?.event || responseData;

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

  if (error) {
    console.log("Error details:", error);
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center p-8">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-red-600 mb-2">Error Loading Event</h2>
            <p className="text-gray-600 mb-4">
              {error?.message || "An error occurred while loading the event."}
            </p>
            <p className="text-sm text-gray-500 mb-4">Event ID: {eventId}</p>
            <Button onClick={() => navigate(-1)} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center p-8">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-red-600 mb-2">Event Not Found</h2>
            <p className="text-gray-600 mb-4">
              Sorry, we couldn't find the event you're looking for.
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Event ID: {eventId}
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Response Data: {JSON.stringify(responseData)}
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

  const getTicketTypeIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'vip': return <Crown className="w-4 h-4" />;
      case 'premium': return <Gem className="w-4 h-4" />;
      case 'standard': return <Shield className="w-4 h-4" />;
      default: return <Ticket className="w-4 h-4" />;
    }
  };

  const getTicketTypeColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'vip': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'premium': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'standard': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Calculate totals from ticket variants
  const totalTickets = event.ticketVariants?.reduce((sum: number, variant: any) => sum + (variant.totalTickets || 0), 0) || 0;
  const totalSold = event.ticketVariants?.reduce((sum: number, variant: any) => sum + (variant.ticketsSold || 0), 0) || 0;
  const availableTickets = totalTickets - totalSold;
  const ticketsSoldPercentage = totalTickets > 0 ? (totalSold / totalTickets) * 100 : 0;

  // Get price range
  const prices = event.ticketVariants?.map((variant: any) => variant.price).filter(Boolean) || [];
  const minPrice = prices.length > 0 ? Math.min(...prices) : null;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : null;
  const priceDisplay = minPrice && maxPrice ? 
    (minPrice === maxPrice ? `₹${minPrice}` : `₹${minPrice} - ₹${maxPrice}`) : 'Free';

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
              {event.category && (
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 capitalize">
                  {event.category}
                </Badge>
              )}
              {event.status && (
                <Badge className={getStatusColor(event.status)} variant="secondary">
                  {event.status}
                </Badge>
              )}
              {event.isActive && (
                <Badge className="bg-green-100 text-green-800" variant="secondary">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Active
                </Badge>
              )}
            </div>
            <CardTitle className="text-3xl lg:text-4xl font-bold text-gray-900">
              {event.title || 'Event Title'}
            </CardTitle>
            <p className="text-lg text-gray-600 mt-2">
              {event.description || 'No description available'}
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
                  <p className="text-sm text-gray-600">{event.venueName || 'TBA'}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 rounded-lg bg-purple-50">
                <IndianRupee className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-sm font-medium">Price Range</p>
                  <p className="text-sm text-gray-600">{priceDisplay}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Ticket Variants Section */}
            {event.ticketVariants && event.ticketVariants.length > 0 && (
              <>
                <Card className="bg-gradient-to-r from-yellow-50 to-orange-50">
                  <CardHeader className="pb-3">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Ticket className="w-5 h-5 text-yellow-600" />
                      Ticket Options
                    </h3>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {event.ticketVariants.map((variant: any, index: number) => {
                        const availableForVariant = variant.totalTickets - variant.ticketsSold;
                        const soldPercentage = variant.totalTickets > 0 ? (variant.ticketsSold / variant.totalTickets) * 100 : 0;
                        
                        return (
                          <Card key={variant._id || index} className={`border-2 ${getTicketTypeColor(variant.type)}`}>
                            <CardHeader className="pb-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  {getTicketTypeIcon(variant.type)}
                                  <h4 className="font-semibold capitalize">{variant.type}</h4>
                                </div>
                                <Badge variant="outline" className="text-xs">
                                  {availableForVariant}/{variant.totalTickets}
                                </Badge>
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              <p className="text-sm text-gray-600">{variant.description}</p>
                              
                              <div className="flex justify-between items-center">
                                <span className="text-lg font-bold text-gray-900">₹{variant.price}</span>
                                <span className="text-sm text-gray-500">Max {variant.maxPerUser}</span>
                              </div>

                              {variant.benefits && variant.benefits.length > 0 && (
                                <div>
                                  <p className="text-xs font-medium text-gray-700 mb-1">Benefits:</p>
                                  <ul className="text-xs text-gray-600 space-y-1">
                                    {variant.benefits.map((benefit: string, idx: number) => (
                                      <li key={idx} className="flex items-center gap-1">
                                        <CheckCircle className="w-3 h-3 text-green-500" />
                                        {benefit}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {/* Progress Bar for this variant */}
                              <div>
                                <div className="flex justify-between text-xs text-gray-500 mb-1">
                                  <span>Sold</span>
                                  <span>{Math.round(soldPercentage)}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-1.5">
                                  <div 
                                    className="bg-gradient-to-r from-yellow-400 to-orange-500 h-1.5 rounded-full transition-all duration-300"
                                    style={{ width: `${soldPercentage}%` }}
                                  />
                                </div>
                              </div>

                              {availableForVariant === 0 && (
                                <Badge className="w-full justify-center bg-red-100 text-red-800">
                                  Sold Out
                                </Badge>
                              )}
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                <Separator />
              </>
            )}

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
                  {event.createdAt && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Created:</span>
                      <span className="text-sm font-medium">{formatDateTime(event.createdAt)}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Overall Ticket Summary */}
              <Card className="bg-gray-50">
                <CardHeader className="pb-3">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Ticket className="w-5 h-5 text-blue-600" />
                    Ticket Summary
                  </h3>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Tickets:</span>
                    <span className="text-sm font-medium">{totalTickets}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Sold:</span>
                    <span className="text-sm font-medium text-green-600">{totalSold}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Available:</span>
                    <span className="text-sm font-medium text-blue-600">{availableTickets}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Ticket Types:</span>
                    <span className="text-sm font-medium">{event.ticketVariants?.length || 0}</span>
                  </div>
                  {/* Overall Progress Bar */}
                  <div className="mt-2">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Overall Sales</span>
                      <span>{Math.round(ticketsSoldPercentage)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full transition-all duration-300"
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
                    <p className="text-gray-900">{event.venueName || 'TBA'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Address</p>
                    <p className="text-gray-900">{event.address || 'TBA'}</p>
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
                    <p className="text-2xl font-bold text-blue-600">{event.attendeesCount || 0}</p>
                    <p className="text-sm text-gray-600">Current Attendees</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{totalSold}</p>
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
                 minPrice ? `Buy Tickets - ${priceDisplay}` : 'Get Free Tickets'}
              </Button>
              <Button variant="outline" size="lg" className="flex-1 border-yellow-300 text-yellow-700 hover:bg-yellow-50">
                <User className="w-5 h-5 mr-2" />
                Contact Organizer
              </Button>
            </div>

            {/* Event ID for Reference */}
            <div className="text-center text-xs text-gray-400 pt-4">
              Event ID: {event._id || event.id || eventId}
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