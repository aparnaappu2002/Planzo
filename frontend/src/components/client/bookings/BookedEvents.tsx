import { useState, useEffect } from "react";
import { Calendar, Ticket, Search, Filter, Eye, MapPin, Clock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { TicketAndEventType } from "@/types/TicketAndEventType";
import { useFindTicketAndEventsDetails } from "@/hooks/clientCustomHooks";
import { RootState } from "@/redux/Store";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { TicketDetailsModal } from "./TicketDetailedModal";
import { useQueryClient } from "@tanstack/react-query";
import Pagination from "@/components/other components/Pagination";

export default function BookedEvents() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const clientId = useSelector((state: RootState) => state.clientSlice.client?._id);
  const queryClient = useQueryClient();

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
    console.log("Current Page:", currentPage, "Client ID:", clientId, "Loading:", isLoading, "Fetching:", isFetching, "Error:", isError);
  }, [currentPage, clientId, isLoading, isFetching, isError, data]);

  // Reset to page 1 when clientId changes and clear search
  useEffect(() => {
    setCurrentPage(1);
    setSearchTerm("");
  }, [clientId]);

  // Force refetch when page changes
  useEffect(() => {
    if (clientId && currentPage > 0) {
      refetch();
    }
  }, [currentPage, clientId, refetch]);

  useEffect(() => {
    if (data) {
      console.log('API Data:', data);
      console.log('Tickets:', data.ticketAndEventDetails);
    }
    if (error) {
      console.log('API Error:', error);
    }
  }, [data, currentPage, error]);

  // Sort tickets by event.startTime in descending order (most recent first)
  const sortedTickets = data?.ticketAndEventDetails
    ? [...data.ticketAndEventDetails].sort((a, b) => {
        const dateA = a.event.startTime ? new Date(a.event.startTime).getTime() : 0;
        const dateB = b.event.startTime ? new Date(b.event.startTime).getTime() : 0;
        return dateB - dateA;
      })
    : [];

  // Log sorted tickets for debugging
  useEffect(() => {
    if (sortedTickets.length > 0) {
      console.log("Sorted Tickets:", sortedTickets.map(ticket => ({
        ticketId: ticket.ticketId,
        eventTitle: ticket.event.title,
        startTime: ticket.event.startTime || 'N/A',
        objectIdTimestamp: new Date(parseInt(ticket._id.substring(0, 8), 16) * 1000).toISOString()
      })));
    }
  }, [sortedTickets]);

  const handleCancelTicket = (ticketId: string) => {
    queryClient.invalidateQueries({ queryKey: ['ticketAndEventDetails'] });
    refetch();
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (error) {
      console.error('Date format error:', error);
      return 'Invalid date';
    }
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

  const filteredTickets = sortedTickets.filter(ticket => 
    !searchTerm || 
    ticket.event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.ticketId.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

      {data && !isLoading && (
        <>
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
                          <Button onClick={() => setCurrentPage(1)} variant="outline">
                            Go to First Page
                          </Button>
                          <Button onClick={() => setCurrentPage(currentPage - 1)} variant="outline">
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
                        <TableHead className="w-[100px]">Actions</TableHead>
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
                                  onCancelTicket={handleCancelTicket}
                                />
                              </DialogContent>
                            </Dialog>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
              
              {data.totalPages > 1 && (
                <div className="mt-8">
                  <Pagination
                    total={data.totalPages}
                    current={currentPage}
                    setPage={setCurrentPage}
                  />
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}