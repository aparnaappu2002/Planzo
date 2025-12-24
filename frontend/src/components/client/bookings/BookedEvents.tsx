
import { useState, useEffect } from "react";
import { Calendar, Ticket, Filter, Eye, MapPin, Clock, Users, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TicketAndEventType } from "@/types/TicketAndEventType";
import { useFindTicketAndEventsDetails, useFindTicketsByStatus } from "@/hooks/clientCustomHooks";
import { RootState } from "@/redux/Store";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { TicketDetailsModal } from "./TicketDetailedModal";
import { useQueryClient } from "@tanstack/react-query";
import Pagination from "@/components/other components/Pagination";

export default function BookedEvents() {
  const [currentPage, setCurrentPage] = useState(1);
  const [ticketStatusFilter, setTicketStatusFilter] = useState("all");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const clientId = useSelector((state: RootState) => state.clientSlice.client?._id);
  const queryClient = useQueryClient();

  // Use filtered hook when filters are applied, otherwise use the original hook
  const useFilteredData = ticketStatusFilter !== "all" || paymentStatusFilter !== "all";

  const { 
    data: originalData, 
    isLoading: originalLoading, 
    error: originalError, 
    refetch: originalRefetch,
    isFetching: originalFetching,
    isError: originalIsError
  } = useFindTicketAndEventsDetails(clientId, currentPage, { enabled: !useFilteredData && !!clientId });
  console.log("Bookings:",originalData)

  const { 
    data: filteredData, 
    isLoading: filteredLoading, 
    error: filteredError, 
    refetch: filteredRefetch,
    isFetching: filteredFetching,
    isError: filteredIsError
  } = useFindTicketsByStatus(
    ticketStatusFilter === "all" ? undefined : ticketStatusFilter,
    paymentStatusFilter === "all" ? undefined : paymentStatusFilter,
    currentPage,
    sortBy,
    { enabled: useFilteredData && !!clientId }
  );

  // Adjust data access based on filtered or original data
  const data = useFilteredData ? filteredData?.data : originalData;
  const isLoading = useFilteredData ? filteredLoading : originalLoading;
  const error = useFilteredData ? filteredError : originalError;
  const refetch = useFilteredData ? filteredRefetch : originalRefetch;
  const isFetching = useFilteredData ? filteredFetching : originalFetching;
  const isError = useFilteredData ? filteredIsError : originalIsError;

  // Debug data structure
  useEffect(() => {
    console.log('Original Data:', originalData);
    console.log('Filtered Data:', filteredData);
  }, [originalData, filteredData]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [ticketStatusFilter, paymentStatusFilter, sortBy]);

  // Reset to page 1 when clientId changes
  useEffect(() => {
    setCurrentPage(1);
  }, [clientId]);

  // Force refetch when page or clientId changes
  useEffect(() => {
    if (clientId && currentPage > 0) {
      refetch();
    }
  }, [currentPage, clientId, refetch]);

  // Show error toast
  useEffect(() => {
    if (error) {
      console.error('API Error:', error);
      toast.error('Failed to load events. Please try again.');
    }
  }, [error]);

  const handleCancelTicket = (ticketId: string) => {
    queryClient.invalidateQueries({ queryKey: ['ticketAndEventDetails', clientId] });
    queryClient.invalidateQueries({ queryKey: ['ticketsByStatus', ticketStatusFilter, paymentStatusFilter, sortBy] });
    refetch();
  };

  const formatDate = (dateInput?: string | string[]) => {
    if (!dateInput) return 'N/A';
    const dateString = Array.isArray(dateInput) ? dateInput[0] : dateInput;
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (error) {
      console.error('Date format error:', error);
      return 'N/A';
    }
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return 'N/A';
    try {
      // Check if timeString is a full ISO date and extract time
      const time = timeString.includes('T') 
        ? new Date(timeString).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: 'numeric',
            hour12: true
          })
        : new Date(`1970-01-01T${timeString}`).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: 'numeric',
            hour12: true
          });
      return time;
    } catch (error) {
      console.error('Time format error:', error);
      return 'N/A';
    }
  };

  const getStatusBadge = (status: string = 'unknown', type: 'payment' | 'ticket') => {
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

  const clearFilters = () => {
    setTicketStatusFilter("all");
    setPaymentStatusFilter("all");
    setSortBy("newest");
    setCurrentPage(1);
  };

  const getFilterLabel = () => {
    const filters = [];
    if (ticketStatusFilter !== "all") filters.push(`Ticket: ${ticketStatusFilter}`);
    if (paymentStatusFilter !== "all") filters.push(`Payment: ${paymentStatusFilter}`);
    return filters.length > 0 ? filters.join(", ") : "All Tickets";
  };

  if (isError) {
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
                {(useFilteredData ? data.tickets?.length : data.ticketAndEventDetails?.length) || 0} tickets
              </Badge>
              <Badge variant="outline" className="border-primary/30 text-primary">
                Page {currentPage} of {data.totalPages || 1}
              </Badge>
            </div>
          )}
        </div>
      </div>

      <div className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="justify-between min-w-[150px]">
                <Filter className="h-4 w-4 mr-2" />
                Ticket Status
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Ticket Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setTicketStatusFilter("all")}>
                All Tickets
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTicketStatusFilter("unused")}>
                Unused
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTicketStatusFilter("used")}>
                Used
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTicketStatusFilter("refunded")}>
                Refunded
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="justify-between min-w-[150px]">
                Payment Status
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Payment Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setPaymentStatusFilter("all")}>
                All Payments
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setPaymentStatusFilter("successful")}>
                Successful
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setPaymentStatusFilter("pending")}>
                Pending
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setPaymentStatusFilter("failed")}>
                Failed
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setPaymentStatusFilter("refunded")}>
                Refunded
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="justify-between min-w-[120px]">
                Sort By
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Sort By</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setSortBy("newest")}>
                Newest First
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("oldest")}>
                Oldest First
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("amount-high-low")}>
                Amount: High to Low
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("amount-low-high")}>
                Amount: Low to High
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {(ticketStatusFilter !== "all" || paymentStatusFilter !== "all" || sortBy !== "newest") && (
            <Button variant="ghost" onClick={clearFilters}>
              Clear Filters
            </Button>
          )}
        </div>

        {(ticketStatusFilter !== "all" || paymentStatusFilter !== "all") && (
          <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-lg">
            <p className="text-sm text-muted-foreground">
              Showing: <span className="font-medium text-primary">{getFilterLabel()}</span>
            </p>
          </div>
        )}
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
              {isLoading ? 'Loading...' : 'Fetching filtered data...'}
            </div>
          </CardContent>
        </Card>
      )}

      {data && !isLoading && !isFetching && (
        <>
          {(useFilteredData ? (data.tickets?.length === 0) : (data.ticketAndEventDetails?.length === 0)) ? (
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-12 text-center">
                <Calendar className="h-16 w-16 text-primary/60 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">No Events Found</h3>
                <p className="text-muted-foreground mb-6">
                  {useFilteredData ? (
                    "No tickets match your current filters. Try adjusting your filter criteria."
                  ) : (
                    "You haven't booked any events yet. Start exploring events to book your first ticket!"
                  )}
                </p>
                <div className="flex gap-3 justify-center">
                  {useFilteredData ? (
                    <Button onClick={clearFilters} variant="outline">
                      Clear Filters
                    </Button>
                  ) : (
                    <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                      Browse Events
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-4 font-medium">Event</th>
                          <th className="text-left p-4 font-medium">Date</th>
                          <th className="text-left p-4 font-medium">Tickets</th>
                          <th className="text-left p-4 font-medium">Amount</th>
                          <th className="text-left p-4 font-medium">Payment</th>
                          <th className="text-left p-4 font-medium">Status</th>
                          <th className="text-left p-4 font-medium w-[100px]">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(useFilteredData ? data.tickets || [] : data.ticketAndEventDetails || []).map((ticket: TicketAndEventType) => {
                          // Use eventId for filtered data, event for original data
                          const event = useFilteredData ? ticket.eventId : ticket.event;
                          return (
                            <tr key={ticket._id} className="border-b hover:bg-muted/50">
                              <td className="p-4">
                                <div className="flex items-center gap-3">
                                  {event?.posterImage?.[0] && (
                                    <div className="w-12 h-12 rounded-lg overflow-hidden border border-border flex-shrink-0">
                                      <img
                                        src={event.posterImage[0]}
                                        alt={event.title || 'Event'}
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                  )}
                                  <div>
                                    <p className="font-medium text-foreground">{event?.title || 'N/A'}</p>
                                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                      <MapPin className="h-3 w-3" />
                                      {event?.address?.split(',')[0] || 'N/A'}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="p-4">
                                <div className="text-sm">
                                  <p className="font-medium">{formatDate(event?.date)}</p>
                                  <p className="text-muted-foreground flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {formatTime(event?.startTime)}
                                  </p>
                                </div>
                              </td>
                              <td className="p-4">
                                <div className="flex items-center gap-1 text-sm">
                                  <Users className="h-4 w-4 text-primary" />
                                  <span className="font-medium">{ticket.ticketCount || 0}</span>
                                </div>
                              </td>
                              <td className="p-4">
                                <div className="text-sm">
                                  <p className="font-bold text-primary">₹{ticket.totalAmount || 0}</p>
                                  <p className="text-muted-foreground">
                                    ₹{event?.pricePerTicket || ticket.ticketVariants?.[0]?.price || 0} each
                                  </p>
                                </div>
                              </td>
                              <td className="p-4">
                                <span className={getStatusBadge(ticket.paymentStatus)}>
                                  {ticket.paymentStatus || 'Unknown'}
                                </span>
                              </td>
                              <td className="p-4">
                                <span className={getStatusBadge(ticket.ticketStatus, 'ticket')}>
                                  {ticket.ticketStatus || 'Unknown'}
                                </span>
                              </td>
                              <td className="p-4">
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
                                      ticket={{ ...ticket, event: event }} // Pass event for consistency
                                      onCancelTicket={handleCancelTicket}
                                    />
                                  </DialogContent>
                                </Dialog>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
              
              {data.totalPages > 1 && (
                <div className="mt-8">
                  <Pagination
                    total={data.totalPages || 1}
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
