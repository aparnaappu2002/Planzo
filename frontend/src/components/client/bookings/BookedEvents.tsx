import { useState } from "react";
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

function TicketDetailsModal({ ticket, onCancelTicket }: { ticket: TicketAndEventType; onCancelTicket: (ticketId: string) => void }) {
  const { event } = ticket;
  
  const getPaymentStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
      case 'completed':
      case 'successful': // Added successful status
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
      case 'refunded': // Added refunded status
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const canCancelTicket = () => {
    const eventDate = new Date(event.date);
    const today = new Date();
    const daysDifference = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
    
    // Check if ticket status is refunded - if so, cannot cancel
    if (ticket.ticketStatus.toLowerCase() === 'refunded') {
      return false;
    }
    
    // Check if payment is successful
    const paymentSuccess = ['paid', 'completed', 'successful'].includes(ticket.paymentStatus.toLowerCase());
    
    // Check if ticket is unused (or active/valid for backward compatibility)
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
            <Clock className="h-4 w-4 text-primary" />
            <span>{formatTime(event.startTime)} - {formatTime(event.endTime)}</span>
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

export default function BookedEvents() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  
  const clientId = useSelector((state: RootState) => state.clientSlice.client?._id) 
  
  const { 
    data, 
    isLoading, 
    error, 
    refetch 
  } = useFindTicketAndEventsDetails(clientId, currentPage);

  const ticketCancellation = useTicketCancellation();
  
  console.log(data)

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleCancelTicket = async (ticketObjectId: string) => {
    try {
      console.log('Attempting to cancel ticket with ObjectId:', ticketObjectId);
      await ticketCancellation.mutateAsync(ticketObjectId);
      toast.success('Ticket cancelled successfully')
      refetch();
      // Optionally show success message
      console.log('Ticket cancelled successfully');
    } catch (error) {
      console.error('Failed to cancel ticket:', error);
      let errorMessage = "Ticket Cancel Failed";
      
      if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    toast.error(errorMessage); 
    }
  };

  const canCancelTicket = (ticket: TicketAndEventType) => {
    // Check if ticket status is refunded - if so, cannot cancel
    if (ticket.ticketStatus.toLowerCase() === 'refunded') {
      return false;
    }

    // Check if payment is successful
    const paymentSuccess = ['paid', 'completed', 'successful'].includes(ticket.paymentStatus.toLowerCase());
    
    // Check if ticket is unused (or active/valid for backward compatibility)
    const ticketUnused = ['unused', 'active', 'valid'].includes(ticket.ticketStatus.toLowerCase());
    
    console.log('Cancel check for ticket:', ticket.ticketId, {
      paymentStatus: ticket.paymentStatus,
      ticketStatus: ticket.ticketStatus,
      paymentSuccess,
      ticketUnused,
      canCancel: paymentSuccess && ticketUnused
    });
    
    return paymentSuccess && ticketUnused;
  };

  const getStatusBadge = (status: string, type: 'payment' | 'ticket') => {
    const baseClasses = "text-xs px-2 py-1 rounded-full border";
    
    if (type === 'payment') {
      switch (status.toLowerCase()) {
        case 'paid':
        case 'completed':
        case 'successful': // Added successful status
          return `${baseClasses} bg-green-100 text-green-800 border-green-200`;
        case 'pending':
          return `${baseClasses} bg-yellow-100 text-yellow-800 border-yellow-200`;
        case 'failed':
        case 'cancelled':
          return `${baseClasses} bg-red-100 text-red-800 border-red-200`;
        default:
          return `${baseClasses} bg-gray-100 text-gray-800 border-gray-200`;
      }
    } else {
      switch (status.toLowerCase()) {
        case 'unused': // Added unused status
        case 'active':
        case 'valid':
          return `${baseClasses} bg-green-100 text-green-800 border-green-200`;
        case 'used':
          return `${baseClasses} bg-blue-100 text-blue-800 border-blue-200`;
        case 'expired':
        case 'cancelled':
        case 'refunded': // Added refunded status
          return `${baseClasses} bg-red-100 text-red-800 border-red-200`;
        default:
          return `${baseClasses} bg-gray-100 text-gray-800 border-gray-200`;
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const renderPagination = () => {
    if (!data || data.totalPages <= 1) return null;

    const pages = [];
    for (let i = 1; i <= data.totalPages; i++) {
      pages.push(
        <Button
          key={i}
          variant={i === currentPage ? "default" : "outline"}
          size="sm"
          onClick={() => handlePageChange(i)}
        >
          {i}
        </Button>
      );
    }

    return (
      <div className="flex items-center justify-center gap-2 mt-8">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        
        <div className="flex gap-1">
          {pages}
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === data.totalPages}
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-8 border border-primary/20 mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">Booked Events</h1>
          <p className="text-muted-foreground">View all your upcoming and past events.</p>
        </div>
        
        <Card className="border-destructive/20 bg-destructive/5">
          <CardContent className="p-6 text-center">
            <p className="text-destructive mb-4">Failed to load your booked events.</p>
            <Button onClick={() => refetch()} variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-8 border border-primary/20 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
              <Ticket className="h-8 w-8 text-primary" />
              Booked Events
            </h1>
            <p className="text-muted-foreground">View all your upcoming and past events.</p>
          </div>
          
          {data && (
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                {data.ticketAndEventDetails.length} tickets
              </Badge>
              <Badge variant="outline" className="border-primary/30 text-primary">
                Page {currentPage} of {data.totalPages}
              </Badge>
            </div>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-muted rounded w-full"></div>
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Content - Table Format */}
      {data && !isLoading && (
        <>
          {data.ticketAndEventDetails.length === 0 ? (
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-12 text-center">
                <Calendar className="h-16 w-16 text-primary/60 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">No Events Found</h3>
                <p className="text-muted-foreground mb-6">
                  You haven't booked any events yet. Start exploring events to book your first ticket!
                </p>
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Browse Events
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Event</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Tickets</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Payment</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-[250px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.ticketAndEventDetails
                        .filter(ticket => 
                          !searchTerm || 
                          ticket.event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          ticket.ticketId.toLowerCase().includes(searchTerm.toLowerCase())
                        )
                        .map((ticket) => (
                          <TableRow key={ticket._id} className="hover:bg-muted/50">
                            <TableCell>
                              <div className="flex items-center gap-3">
                                {ticket.event.posterImage && (
                                  <div className="w-12 h-12 rounded-lg overflow-hidden border border-border flex-shrink-0">
                                    <img
                                      src={ticket.event.posterImage[0]}
                                      alt={ticket.event.title}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                )}
                                <div>
                                  <p className="font-medium text-foreground">{ticket.event.title}</p>
                                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                    <MapPin className="h-3 w-3" />
                                    {ticket.event.address.split(',')[0]}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <p className="font-medium">{formatDate(ticket.event.date)}</p>
                                <p className="text-muted-foreground flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {ticket.event.startTime}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1 text-sm">
                                <Users className="h-4 w-4 text-primary" />
                                <span className="font-medium">{ticket.ticketCount}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <p className="font-bold text-primary">₹{ticket.totalAmount}</p>
                                <p className="text-muted-foreground">₹{ticket.event.pricePerTicket} each</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className={getStatusBadge(ticket.paymentStatus, 'payment')}>
                                {ticket.paymentStatus}
                              </span>
                            </TableCell>
                            <TableCell>
                              <span className={getStatusBadge(ticket.ticketStatus, 'ticket')}>
                                {ticket.ticketStatus}
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2 items-center">
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button size="sm" variant="outline">
                                      <Eye className="h-4 w-4 mr-1" />
                                      Details
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                                    <DialogHeader>
                                      <DialogTitle>Ticket Details</DialogTitle>
                                    </DialogHeader>
                                    <TicketDetailsModal 
                                      ticket={ticket} 
                                      onCancelTicket={(ticketObjectId) => handleCancelTicket(ticketObjectId)}
                                    />
                                  </DialogContent>
                                </Dialog>
                                
                                {/* Confirmation Modal for Cancel Ticket */}
                                {ticket.ticketStatus.toLowerCase() === 'refunded' ? (
                                  <Button size="sm" variant="secondary" disabled>
                                    <X className="h-4 w-4 mr-1" />
                                    Cancelled
                                  </Button>
                                ) : (
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button 
                                        size="sm" 
                                        variant={canCancelTicket(ticket) ? "destructive" : "outline"}
                                        disabled={!canCancelTicket(ticket) || ticketCancellation.isPending}
                                        title={!canCancelTicket(ticket) ? `Cannot cancel: ${ticket.paymentStatus} payment, ${ticket.ticketStatus} ticket` : ''}
                                      >
                                        <X className="h-4 w-4 mr-1" />
                                        {ticketCancellation.isPending ? 'Cancelling...' : 'Cancel'}
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle className="flex items-center gap-2">
                                          <AlertTriangle className="h-5 w-5 text-destructive" />
                                          Cancel Ticket Confirmation
                                        </AlertDialogTitle>
                                        <AlertDialogDescription className="space-y-2">
                                          <p>Are you sure you want to cancel this ticket for <strong>"{ticket.event.title}"</strong>?</p>
                                          <div className="bg-muted rounded-lg p-3 mt-3">
                                            <p className="text-sm font-medium">Ticket Details:</p>
                                            <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                                              <li>• Ticket ID: {ticket.ticketId}</li>
                                              <li>• Quantity: {ticket.ticketCount} ticket{ticket.ticketCount > 1 ? 's' : ''}</li>
                                              <li>• Total Amount: ₹{ticket.totalAmount}</li>
                                              <li>• Event Date: {formatDate(ticket.event.date)}</li>
                                            </ul>
                                          </div>
                                          <p className="text-sm text-destructive font-medium mt-3">
                                            ⚠️ This action cannot be undone and may affect your refund eligibility.
                                          </p>
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>
                                          Keep Ticket
                                        </AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => {
                                            console.log('Cancelling ticket with ID:', ticket._id);
                                            handleCancelTicket(ticket._id);
                                          }}
                                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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
                                              Yes, Cancel Ticket
                                            </>
                                          )}
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
              
              {renderPagination()}
            </>
          )}
        </>
      )}
    </div>
  );
}