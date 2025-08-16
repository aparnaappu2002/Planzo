import { Calendar, Clock, MapPin, Users, CreditCard, QrCode, Phone, Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TicketAndEventType } from "@/types/TicketAndEventType";

interface TicketCardProps {
  ticket: TicketAndEventType;
}

export function TicketCard({ ticket }: TicketCardProps) {
  const { event } = ticket;
  
  const getPaymentStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'failed':
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTicketStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'valid':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'used':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'expired':
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className="overflow-hidden bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 hover:shadow-lg transition-all duration-300">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <CardTitle className="text-xl font-bold text-foreground mb-2 line-clamp-2">
              {event.title}
            </CardTitle>
            <div className="flex flex-wrap gap-2">
              <Badge className={getPaymentStatusColor(ticket.paymentStatus)}>
                {ticket.paymentStatus}
              </Badge>
              <Badge className={getTicketStatusColor(ticket.ticketStatus)}>
                {ticket.ticketStatus}
              </Badge>
            </div>
          </div>
          {event.posterImage && (
            <div className="w-20 h-20 rounded-lg overflow-hidden border-2 border-primary/20 shadow-sm">
              <img
                src={event.posterImage}
                alt={event.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Event Details */}
        <div className="bg-background/60 rounded-xl p-4 border border-primary/10">
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            Event Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4 text-primary" />
              <span>{formatDate(event.date)}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4 text-primary" />
              <span>{formatTime(event.startTime)} - {formatTime(event.endTime)}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground md:col-span-2">
              <MapPin className="h-4 w-4 text-primary" />
              <span className="truncate">{event.address}</span>
            </div>
          </div>
          {event.description && (
            <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
              {event.description}
            </p>
          )}
        </div>

        {/* Ticket Details */}
        <div className="bg-background/60 rounded-xl p-4 border border-primary/10">
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <QrCode className="h-4 w-4 text-primary" />
            Ticket Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-muted-foreground">Ticket ID:</span>
              <p className="font-mono font-medium text-foreground">{ticket.ticketId}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Quantity:</span>
              <p className="font-medium text-foreground flex items-center gap-1">
                <Users className="h-4 w-4 text-primary" />
                {ticket.ticketCount} {ticket.ticketCount === 1 ? 'ticket' : 'tickets'}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Total Amount:</span>
              <p className="font-bold text-lg text-primary flex items-center gap-1">
                <CreditCard className="h-4 w-4" />
                ${ticket.totalAmount}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Price per ticket:</span>
              <p className="font-medium text-foreground">${event.pricePerTicket}</p>
            </div>
          </div>
        </div>

        {/* Contact Details */}
        <div className="bg-background/60 rounded-xl p-4 border border-primary/10">
          <h3 className="font-semibold text-foreground mb-3">Contact Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-4 w-4 text-primary" />
              <span>{ticket.phone}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="h-4 w-4 text-primary" />
              <span className="truncate">{ticket.email}</span>
            </div>
          </div>
        </div>

        {/* QR Code Action */}
        {ticket.qrCodeLink && (
          <div className="flex justify-center pt-2">
            <Button 
              variant="default" 
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={() => window.open(ticket.qrCodeLink, '_blank')}
            >
              <QrCode className="h-4 w-4 mr-2" />
              View QR Code
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}