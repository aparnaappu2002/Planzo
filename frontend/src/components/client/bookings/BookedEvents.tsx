import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Calendar, Ticket, Search, Filter, Eye, MapPin, Clock, Users, CreditCard, Phone, Mail, QrCode, X, AlertTriangle, RotateCcw } from "lucide-react";
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
import { TicketDetailsModal } from "./TicketDetailedModal";



export default function BookedEvents() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [retryingPayment, setRetryingPayment] = useState<string | null>(null);
  
  const clientId = useSelector((state: RootState) => state.clientSlice.client?._id) 
  
  const { 
    data, 
    isLoading, 
    error, 
    refetch,
    isFetching,
    isError
  } = useFindTicketAndEventsDetails(clientId, currentPage);

  // Log hook state changes
  useEffect(() => {
    console.log('Hook State Change:', {
      currentPage,
      clientId,
      isLoading,
      isFetching,
      isError,
      hasData: !!data,
      dataKeys: data ? Object.keys(data) : null
    });
  }, [currentPage, clientId, isLoading, isFetching, isError, data]);

  const ticketCancellation = useTicketCancellation();
  
  // Reset to page 1 when clientId changes and clear search
  useEffect(() => {
    setCurrentPage(1);
    setSearchTerm("");
  }, [clientId]);

  // Force refetch when page changes (temporary solution if auto-refetch doesn't work)
  useEffect(() => {
    if (clientId && currentPage > 0) {
      console.log(`Triggering refetch for page ${currentPage}`);
      refetch();
    }
  }, [currentPage, clientId, refetch]);

  // Debug: Log the full data response
  useEffect(() => {
    if (data) {
      console.log('=== FULL API RESPONSE DEBUG ===');
      console.log('Current Page State:', currentPage);
      console.log('API Response Keys:', Object.keys(data));
      console.log('Full Response:', JSON.stringify(data, null, 2));
      console.log('ticketAndEventDetails type:', typeof data.ticketAndEventDetails);
      console.log('ticketAndEventDetails isArray:', Array.isArray(data.ticketAndEventDetails));
      console.log('================================');
    }
    if (error) {
      console.log('API Error:', error);
    }
  }, [data, currentPage, error]);

  const handlePageChange = (page: number) => {
    if (page < 1) return;
    if (data && page > data.totalPages) return;
    
    console.log(`Changing to page ${page} from ${currentPage}`);
    console.log('Current data before page change:', data);
    setCurrentPage(page);
    
    // Force scroll to top immediately
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRetryPayment = async (ticketObjectId: string) => {
    try {
      setRetryingPayment(ticketObjectId);
      // Add your retry payment logic here
      // This would typically redirect to payment gateway or trigger payment process
      
      // Example implementation (replace with your actual payment retry logic):
      // await retryPaymentMutation.mutateAsync(ticketObjectId);
      
      // For now, just show success message - replace with actual implementation
      toast.success('Redirecting to payment gateway...');
      
      // You might want to redirect to payment page here
      // window.location.href = `/payment/retry/${ticketObjectId}`;
      
    } catch (error) {
      console.error('Failed to retry payment:', error);
      let errorMessage = "Payment retry failed";
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setRetryingPayment(null);
    }
  };

  const handleCancelTicket = async (ticketObjectId: string) => {
    try {
      await ticketCancellation.mutateAsync(ticketObjectId);
      toast.success('Ticket cancelled successfully');
      refetch();
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
    if (ticket.ticketStatus.toLowerCase() === 'refunded') {
      return false;
    }

    const paymentSuccess = ['paid', 'completed', 'successful'].includes(ticket.paymentStatus.toLowerCase());
    const ticketUnused = ['unused', 'active', 'valid'].includes(ticket.ticketStatus.toLowerCase());
    
    return paymentSuccess && ticketUnused;
  };

  const canRetryPayment = (ticket: TicketAndEventType) => {
    return ticket.paymentStatus.toLowerCase() === 'pending';
  };

  const getStatusBadge = (status: string, type: 'payment' | 'ticket') => {
    const baseClasses = "text-xs px-2 py-1 rounded-full border";
    
    if (type === 'payment') {
      switch (status.toLowerCase()) {
        case 'paid':
        case 'completed':
        case 'successful':
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
        case 'unused':
        case 'active':
        case 'valid':
          return `${baseClasses} bg-green-100 text-green-800 border-green-200`;
        case 'used':
          return `${baseClasses} bg-blue-100 text-blue-800 border-blue-200`;
        case 'expired':
        case 'cancelled':
        case 'refunded':
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

    // Generate page numbers to display
    const pageNumbers = [];
    const maxVisiblePages = 5;
    const startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(data.totalPages, startPage + maxVisiblePages - 1);
    
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="flex items-center justify-center gap-3 mt-8 p-4">
        {/* Previous Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="flex items-center gap-2 px-4 py-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        
        {/* Show first page and ellipsis if needed */}
        {startPage > 1 && (
          <>
            <Button
              variant={1 === currentPage ? "default" : "outline"}
              size="sm"
              onClick={() => handlePageChange(1)}
              className="min-w-[40px]"
            >
              1
            </Button>
            {startPage > 2 && <span className="px-2 text-muted-foreground">...</span>}
          </>
        )}
        
        {/* Page numbers */}
        <div className="flex gap-1">
          {pageNumbers.map(page => (
            <Button
              key={page}
              variant={page === currentPage ? "default" : "outline"}
              size="sm"
              onClick={() => handlePageChange(page)}
              className="min-w-[40px]"
            >
              {page}
            </Button>
          ))}
        </div>
        
        {/* Show last page and ellipsis if needed */}
        {endPage < data.totalPages && (
          <>
            {endPage < data.totalPages - 1 && <span className="px-2 text-muted-foreground">...</span>}
            <Button
              variant={data.totalPages === currentPage ? "default" : "outline"}
              size="sm"
              onClick={() => handlePageChange(data.totalPages)}
              className="min-w-[40px]"
            >
              {data.totalPages}
            </Button>
          </>
        )}
        
        {/* Next Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage >= data.totalPages}
          className="flex items-center gap-2 px-4 py-2"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
        
        {/* Page Info */}
        <div className="ml-4 text-sm text-muted-foreground">
          Page {currentPage} of {data.totalPages}
        </div>
      </div>
    );
  };

  // Filter tickets based on search term
  const filteredTickets = data?.ticketAndEventDetails?.filter(ticket => 
    !searchTerm || 
    ticket.event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.ticketId.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

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
                {data.totalItems} tickets
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
      {(isLoading || isFetching) && (
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-muted rounded w-full"></div>
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </div>
            <div className="text-center mt-4 text-sm text-muted-foreground">
              {isLoading ? 'Loading...' : 'Fetching page data...'}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Content - Table Format */}
      {data && !isLoading && (
        <>
          {/* Show message if no tickets found OR if data is inconsistent */}
          {data.ticketAndEventDetails.length === 0 ? (
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-12 text-center">
                <Calendar className="h-16 w-16 text-primary/60 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">No Events Found</h3>
                <p className="text-muted-foreground mb-6">
                  {data.totalItems === 0 ? (
                    "You haven't booked any events yet. Start exploring events to book your first ticket!"
                  ) : currentPage > 1 ? (
                    <>
                      No events found on this page. This might be a data loading issue.
                      <br />
                      <span className="text-sm text-destructive">
                        API returned {data.totalItems} total items but 0 items for this page.
                      </span>
                    </>
                  ) : (
                    "No events found. This might be a data loading issue."
                  )}
                </p>
                <div className="flex gap-3 justify-center">
                  {data.totalItems === 0 ? (
                    <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                      Browse Events
                    </Button>
                  ) : (
                    <>
                      {currentPage > 1 && (
                        <>
                          <Button onClick={() => handlePageChange(1)} variant="outline">
                            Go to First Page
                          </Button>
                          <Button onClick={() => handlePageChange(currentPage - 1)} variant="outline">
                            Previous Page
                          </Button>
                        </>
                      )}
                      <Button onClick={() => refetch()} variant="destructive">
                        Retry Loading
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : filteredTickets.length === 0 ? (
            // Show message if search filters out all results
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-12 text-center">
                <Search className="h-16 w-16 text-primary/60 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">No Events Match Your Search</h3>
                <p className="text-muted-foreground mb-6">
                  Try adjusting your search terms or clearing the search to see all events.
                </p>
                <Button onClick={() => setSearchTerm("")} variant="outline">
                  Clear Search
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Table with results */}
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
                        <TableHead className="w-[300px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTickets.map((ticket) => (
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
                            <div className="flex flex-wrap gap-2 items-center">
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
                              
                              {/* Show Retry Payment button for pending payments */}
                              {canRetryPayment(ticket) ? (
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button 
                                      size="sm" 
                                      variant="default"
                                      disabled={retryingPayment === ticket._id}
                                      className="bg-blue-600 hover:bg-blue-700 text-white"
                                    >
                                      <RotateCcw className="h-4 w-4 mr-1" />
                                      {retryingPayment === ticket._id ? 'Retrying...' : 'Retry Payment'}
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle className="flex items-center gap-2">
                                        <CreditCard className="h-5 w-5 text-blue-600" />
                                        Retry Payment
                                      </AlertDialogTitle>
                                      <AlertDialogDescription className="space-y-2">
                                        <p>Complete your pending payment for <strong>"{ticket.event.title}"</strong></p>
                                        <div className="bg-muted rounded-lg p-3 mt-3">
                                          <p className="text-sm font-medium">Payment Details:</p>
                                          <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                                            <li>• Ticket ID: {ticket.ticketId}</li>
                                            <li>• Quantity: {ticket.ticketCount} ticket{ticket.ticketCount > 1 ? 's' : ''}</li>
                                            <li>• Total Amount: ₹{ticket.totalAmount}</li>
                                            <li>• Event Date: {formatDate(ticket.event.date)}</li>
                                            <li>• Current Status: <span className="text-yellow-600 font-medium">Pending Payment</span></li>
                                          </ul>
                                        </div>
                                        <p className="text-sm text-blue-600 font-medium mt-3">
                                          You'll be redirected to the payment gateway to complete your transaction.
                                        </p>
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>
                                        Cancel
                                      </AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => {
                                          handleRetryPayment(ticket._id);
                                        }}
                                        className="bg-blue-600 text-white hover:bg-blue-700"
                                        disabled={retryingPayment === ticket._id}
                                      >
                                        {retryingPayment === ticket._id ? (
                                          <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Processing...
                                          </>
                                        ) : (
                                          <>
                                            <CreditCard className="h-4 w-4 mr-2" />
                                            Complete Payment
                                          </>
                                        )}
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              ) : ticket.ticketStatus.toLowerCase() === 'refunded' ? (
                                <Button size="sm" variant="secondary" disabled>
                                  <X className="h-4 w-4 mr-1" />
                                  Cancelled
                                </Button>
                              ) : (
                                /* Show Cancel button for non-pending payments */
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
              
              {/* Pagination */}
              {renderPagination()}
            </>
          )}
        </>
      )}
      
      {/* Debug info - remove this in production */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-4 p-2 bg-gray-100 rounded text-xs">
          Debug: Current Page: {currentPage}, Total Pages: {data?.totalPages || 0}, 
          Total Items: {data?.totalItems || 0}, Items on Page: {data?.ticketAndEventDetails?.length || 0},
          Client ID: {clientId}, Loading: {isLoading.toString()}
        </div>
      )}
    </div>
  );
}