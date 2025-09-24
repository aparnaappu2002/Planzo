import { useState } from "react";
import { Calendar, Ticket, MapPin, Users, CreditCard, Phone, Mail, X, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { TicketAndEventType } from "@/types/TicketAndEventType";
import { motion } from "framer-motion";
import ReviewModal from "@/components/other components/review/ReviewModal";
import { useTicketCancellation } from "@/hooks/clientCustomHooks";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";

export interface ReviewEntity {
  _id?: string;
  reviewerId: string;
  targetId: string;
  targetType: 'service' | 'event';
  rating: number;
  comment: string;
}

export function TicketDetailsModal({ ticket, onCancelTicket }: { ticket: TicketAndEventType; onCancelTicket: (ticketId: string) => void }) {
  const { event } = ticket;
  const [showAddReviewModal, setShowAddReviewModal] = useState(false);
  const queryClient = useQueryClient();
  const ticketCancellation = useTicketCancellation();

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
      case 'unused':
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

  const formatDate = (dateString: any) => {
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
      console.error('Date format error:', error);
      return 'Date format error';
    }
  };

  const formatTime = (timeString: string) => {
    try {
      return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Time format error:', error);
      return 'Invalid time';
    }
  };

  const handleCancelTicket = () => {
    console.log('Initiating ticket cancellation for ID:', ticket._id);
    ticketCancellation.mutate(ticket._id, {
      onSuccess: () => {
        console.log('Ticket cancellation successful');
        queryClient.invalidateQueries({ queryKey: ['ticketAndEventDetails', ticket._id] });
        queryClient.invalidateQueries({ queryKey: ['ticketAndEventDetails'] });
        toast.success('Booking cancelled successfully');
        onCancelTicket(ticket._id);
      },
      onError: (err: any) => {
        console.error('Cancellation error:', err);
        toast.error(err.message || 'Failed to cancel booking');
      },
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

      {/* Cancelled Status or Action Buttons */}
      {ticket.ticketStatus.toLowerCase() === 'refunded' ? (
        <div className="border-t border-border pt-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <X className="h-5 w-5 text-red-500" />
              <div>
                <h4 className="font-semibold text-red-800 mb-1">Booking Cancelled</h4>
                <p className="text-sm text-red-600">
                  This booking has been cancelled and refunded.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="border-t border-border pt-4">
          <div className="flex gap-3">
            {ticket.ticketStatus === 'unused' && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`rounded-full bg-gradient-to-r from-yellow-500 to-yellow-600 px-6 py-2 text-sm font-medium text-white shadow-lg transition-all duration-300 hover:shadow-yellow-300/50 hover:from-yellow-600 hover:to-yellow-700 ${
                      ticketCancellation.isPending ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    disabled={ticketCancellation.isPending}
                  >
                    <X className="h-4 w-4 mr-2 inline" />
                    {ticketCancellation.isPending ? 'Cancelling...' : 'Cancel Booking'}
                  </motion.button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-destructive" />
                      Cancel Booking Confirmation
                    </AlertDialogTitle>
                    <div className="space-y-2">
                      <p>Are you sure you want to cancel this booking for <strong>"{event.title}"</strong>?</p>
                      <div className="bg-muted rounded-lg p-3 mt-3">
                        <p className="text-sm font-medium">Ticket Details:</p>
                        <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                          <li>• Ticket ID: {ticket.ticketId}</li>
                          <li>• Quantity: {ticket.ticketCount} ticket{ticket.ticketCount > 1 ? 's' : ''}</li>
                          <li>• Total Amount: ₹{ticket.totalAmount}</li>
                          <li>• Event Date: {formatDate(event.date)}</li>
                        </ul>
                      </div>
                      <p className="text-sm text-destructive font-medium mt-3">
                        ⚠️ This action cannot be undone and may affect your refund eligibility.
                      </p>
                    </div>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Keep Booking</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleCancelTicket}
                      className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white hover:from-yellow-600 hover:to-yellow-700"
                      disabled={ticketCancellation.isPending}
                    >
                      {ticketCancellation.isPending ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Cancelling...
                        </>
                      ) : (
                        <>
                          <X className="h-4 w-4 mr-2" />
                          Yes, Cancel Booking
                        </>
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            {ticket.ticketStatus === 'used' && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAddReviewModal(true)}
                className="rounded-full bg-gradient-to-r from-yellow-500 to-yellow-600 px-6 py-2 text-sm font-medium text-white shadow-lg transition-all duration-300 hover:shadow-yellow-300/50 hover:from-yellow-600 hover:to-yellow-700"
              >
                Add Review
              </motion.button>
            )}
          </div>
        </div>
      )}

      <ReviewModal
        ticket={{ _id: ticket._id, event: { _id: ticket.event._id } }}
        showReviewModal={showAddReviewModal}
        setShowReviewModal={setShowAddReviewModal}
      />
    </div>
  );
}