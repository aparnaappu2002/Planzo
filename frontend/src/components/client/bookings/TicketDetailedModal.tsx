import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Calendar, Ticket, Search, Filter, Eye, MapPin, Clock, Users, CreditCard, Phone, Mail, QrCode, X, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { TicketAndEventType } from "@/types/TicketAndEventType";
import { useFindTicketAndEventsDetails, useTicketCancellation } from "@/hooks/clientCustomHooks";
import { RootState } from "@/redux/Store";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";



export function TicketDetailsModal({ ticket, onCancelTicket }: { ticket: TicketAndEventType; onCancelTicket: (ticketId: string) => void }) {
  const { event } = ticket;
  
  const getPaymentStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
      case 'completed':
      case 'successful':
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
      case 'refunded':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const canCancelTicket = () => {
    const eventDate = new Date(event.date);
    const today = new Date();
    const daysDifference = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
    
    if (ticket.ticketStatus.toLowerCase() === 'refunded') {
      return false;
    }
    
    const paymentSuccess = ['paid', 'completed', 'successful'].includes(ticket.paymentStatus.toLowerCase());
    const ticketUnused = ['unused', 'active', 'valid'].includes(ticket.ticketStatus.toLowerCase());
    
    return paymentSuccess && ticketUnused;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date not available';
    
    try {
      let date;
      if (dateString instanceof Date) {
        date = dateString;
      } else if (typeof dateString === 'string' && dateString.includes('-')) {
        const [year, month, day] = dateString.split('-');
        date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      } else {
        date = new Date(dateString);
      }
      
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'Date format error';
    }
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header with Event Image */}
      <div className="flex gap-4 items-start">
        {event.posterImage && (
          <div className="w-24 h-24 rounded-lg overflow-hidden border-2 border-primary/20 shadow-sm flex-shrink-0">
            <img
              src={event.posterImage[0]}
              alt={event.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-foreground mb-2">{event.title}</h2>
          <div className="flex flex-wrap gap-2 mb-3">
            <Badge className={getPaymentStatusColor(ticket.paymentStatus)}>
              {ticket.paymentStatus}
            </Badge>
            <Badge className={getTicketStatusColor(ticket.ticketStatus)}>
              {ticket.ticketStatus}
            </Badge>
          </div>
          {event.description && (
            <p className="text-muted-foreground text-sm">{event.description}</p>
          )}
        </div>
      </div>
          
      {/* Event Details */}
      <div className="bg-muted/30 rounded-xl p-4 border">
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
            {/* <Clock className="h-4 w-4 text-primary" /> */}
            {/* <span>{formatTime(event.startTime)} - {formatTime(event.endTime)}</span> */}
          </div>
          <div className="flex items-center gap-2 text-muted-foreground md:col-span-2">
            <MapPin className="h-4 w-4 text-primary" />
            <span>{event.address}</span>
          </div>
        </div>
      </div>

      {/* Ticket Details */}
      <div className="bg-muted/30 rounded-xl p-4 border">
        <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
          <Ticket className="h-4 w-4 text-primary" />
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
              ₹{ticket.totalAmount}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">Price per ticket:</span>
            <p className="font-medium text-foreground">₹{event.pricePerTicket}</p>
          </div>
        </div>
      </div>

      {/* Contact Details */}
      <div className="bg-muted/30 rounded-xl p-4 border">
        <h3 className="font-semibold text-foreground mb-3">Contact Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Phone className="h-4 w-4 text-primary" />
            <span>{ticket.phone}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Mail className="h-4 w-4 text-primary" />
            <span>{ticket.email}</span>
          </div>
        </div>
      </div>

      {/* QR Code Action */}
      {ticket.qrCodeLink && (
        <div className="border-t border-border pt-4">
          <div className="bg-accent/30 rounded-lg p-4 text-center">
            <div className="w-32 h-32 mx-auto mb-2 rounded-lg flex items-center justify-center border border-primary/20 bg-white p-2">
              <img 
                src={ticket.qrCodeLink} 
                alt="QR Code for ticket verification" 
                className="w-full h-full object-contain"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Show this QR code at the event entrance
            </p>
          </div>
        </div>
      )}

      {/* Cancel Ticket Section or Cancelled Status */}
      {ticket.ticketStatus.toLowerCase() === 'refunded' ? (
        <div className="border-t border-border pt-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <X className="h-5 w-5 text-red-500" />
              <div>
                <h4 className="font-semibold text-red-800 mb-1">Ticket Cancelled</h4>
                <p className="text-sm text-red-600">
                  This ticket has been cancelled and refunded.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : canCancelTicket() && (
        <div className="border-t border-border pt-4">
          <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-destructive mb-1">Cancel Ticket</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Once cancelled, this action cannot be undone. You may be eligible for a refund based on the cancellation policy.
                </p>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <X className="h-4 w-4 mr-2" />
                      Cancel Ticket
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Cancel Ticket</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to cancel this ticket for "{event.title}"? This action cannot be undone and may affect your refund eligibility.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Keep Ticket</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => onCancelTicket(ticket.ticketId)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Cancel Ticket
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
