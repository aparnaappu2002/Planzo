import { useState } from "react";
import { useTicketDetailsWithUser, useSearchTicketsVendor, useFilterTicketsVendor } from "@/hooks/vendorCustomHooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Search, Ticket, Eye, Calendar, MapPin, User, CreditCard, QrCode, RefreshCw, Filter, X } from "lucide-react";
import { toast } from "react-toastify";
import { TicketAndUserDTO } from "@/types/TicketAndUserDTO";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/Store";
import Pagination from "@/components/other components/Pagination";
import { useNavigate } from "react-router-dom";
import { useDebounce } from "@/hooks/useDebounce";

const TicketAndUserDetails: React.FC = () => {
  const vendorId = useSelector((state: RootState) => state.vendorSlice.vendor?._id);
  const [pageNo, setPageNo] = useState(1);
  const [selectedTicket, setSelectedTicket] = useState<TicketAndUserDTO | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'successful' | 'failed' | 'all'>('all');
  const [ticketStatus, setTicketStatus] = useState<'used' | 'refunded' | 'unused' | 'all'>('all');
  const navigate = useNavigate();

  // Debounce search term
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Determine which query to use based on active filters
  const isSearchActive = debouncedSearchTerm.trim().length > 0;
  const isFilterActive = paymentStatus !== 'all' || ticketStatus !== 'all';

  // Search query
  const { 
    data: searchData, 
    isLoading: isSearchLoading, 
    error: searchError 
  } = useSearchTicketsVendor({
    vendorId: vendorId || '',
    searchTerm: debouncedSearchTerm,
    pageNo
  });

  // Filter query
  const { 
    data: filterData, 
    isLoading: isFilterLoading, 
    error: filterError 
  } = useFilterTicketsVendor({
    vendorId: vendorId || '',
    pageNo,
    paymentStatus: paymentStatus !== 'all' ? paymentStatus : undefined,
    ticketStatus: ticketStatus !== 'all' ? ticketStatus : undefined
  });

  // Default query (all tickets)
  const { 
    data: allData, 
    isLoading: isAllLoading, 
    error: allError, 
    refetch 
  } = useTicketDetailsWithUser(vendorId || '', pageNo);

  // Determine which data to use
  let data, isLoading, error;
  
  if (isSearchActive) {
    data = searchData;
    isLoading = isSearchLoading;
    error = searchError;
  } else if (isFilterActive) {
    data = filterData;
    isLoading = isFilterLoading;
    error = filterError;
  } else {
    data = allData;
    isLoading = isAllLoading;
    error = allError;
  }

  console.log("Ticket Data:", data);
 
  // Extract tickets and totalPages from the response
  const tickets = data?.ticketAndEventDetails || [];
  const totalPages = data?.totalPages || 0;

  // Reset to page 1 when search term or filters change
  useState(() => {
    setPageNo(1);
  }, [debouncedSearchTerm, paymentStatus, ticketStatus]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setPaymentStatus('all');
    setTicketStatus('all');
    setPageNo(1);
  };

  const hasActiveFilters = searchTerm || paymentStatus !== 'all' || ticketStatus !== 'all';
 
  const handleSearch = () => {
    if (!vendorId?.trim()) {
      toast.error("Missing vendor information. Please ensure you're logged in.");
      return;
    }
    refetch();
  };

  const handleScanTicket = (ticketId: string, eventId: string) => {
    navigate(`/vendor/scanTickets?ticketId=${ticketId}&eventId=${eventId}`);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'successful':
      case 'unused':
      case 'upcoming':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'failed':
      case 'refunded':
      case 'cancelled':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getTicketVariantsDisplay = (ticket: TicketAndUserDTO) => {
    if (ticket.ticketVariants && ticket.ticketVariants.length > 0) {
      return ticket.ticketVariants.map((v) => v.variant).join(', ');
    }
    return 'Standard';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-yellow-200/10 to-yellow-100">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-2 sm:p-3 bg-yellow-500 rounded-full">
              <Ticket className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-900" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-yellow-600 to-yellow-800 bg-clip-text text-transparent">
              Ticket Details
            </h1>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="p-4 sm:p-6 mb-6 border-yellow-400/20 bg-yellow-200/10">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search Input */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-yellow-600" />
                <Input
                  placeholder="Search by event title..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-yellow-400/30 focus:border-yellow-500"
                />
              </div>

              {/* Payment Status Filter */}
              <div className="w-full sm:w-48">
                <Select
                  value={paymentStatus}
                  onValueChange={(value) => setPaymentStatus(value as any)}
                >
                  <SelectTrigger className="border-yellow-400/30">
                    <SelectValue placeholder="Payment Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Payments</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="successful">Successful</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Ticket Status Filter */}
              <div className="w-full sm:w-48">
                <Select
                  value={ticketStatus}
                  onValueChange={(value) => setTicketStatus(value as any)}
                >
                  <SelectTrigger className="border-yellow-400/30">
                    <SelectValue placeholder="Ticket Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tickets</SelectItem>
                    <SelectItem value="unused">Unused</SelectItem>
                    <SelectItem value="used">Used</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Clear Filters Button */}
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  onClick={handleClearFilters}
                  className="border-yellow-500 text-yellow-800 hover:bg-yellow-300 w-full sm:w-auto"
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              )}
            </div>

            {/* Active Filters Display */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-sm text-yellow-700 font-medium">Active filters:</span>
                {searchTerm && (
                  <Badge variant="secondary" className="bg-yellow-200 text-yellow-800">
                    Search: {searchTerm}
                  </Badge>
                )}
                {paymentStatus !== 'all' && (
                  <Badge variant="secondary" className="bg-yellow-200 text-yellow-800">
                    Payment: {paymentStatus}
                  </Badge>
                )}
                {ticketStatus !== 'all' && (
                  <Badge variant="secondary" className="bg-yellow-200 text-yellow-800">
                    Ticket: {ticketStatus}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </Card>

        {/* Content */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-3">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-yellow-600" />
              <p className="text-yellow-700">Loading ticket details...</p>
            </div>
          </div>
        )}

        {error && (
          <Card className="p-6 border-yellow-400/20 bg-yellow-200/20">
            <div className="text-center space-y-2">
              <p className="text-red-600 font-medium">Error loading ticket details</p>
              <p className="text-sm text-yellow-700">{error.message}</p>
              <Button
                onClick={() => refetch()}
                variant="outline"
                className="mt-4 border-yellow-500 text-yellow-800 hover:bg-yellow-300"
              >
                Try Again
              </Button>
            </div>
          </Card>
        )}

        {tickets && tickets.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl sm:text-2xl font-semibold text-yellow-800">
                Ticket Details ({tickets.length} {hasActiveFilters ? 'filtered' : 'total'})
              </h2>
            </div>
           
            <Card className="border-yellow-400/20 bg-yellow-200/10">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-yellow-400/10">
                      <TableHead className="text-yellow-800">Ticket ID</TableHead>
                      <TableHead className="text-yellow-800 hidden sm:table-cell">Customer</TableHead>
                      <TableHead className="text-yellow-800 hidden md:table-cell">Event</TableHead>
                      <TableHead className="text-yellow-800 hidden sm:table-cell">Amount</TableHead>
                      <TableHead className="text-yellow-800">Payment Status</TableHead>
                      <TableHead className="text-yellow-800 hidden md:table-cell">Ticket Status</TableHead>
                      <TableHead className="text-yellow-800">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tickets.map((ticket: TicketAndUserDTO) => (
                      <TableRow key={ticket._id} className="border-yellow-400/5">
                        <TableCell className="font-medium text-yellow-900">{ticket.ticketId}</TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <div className="space-y-1">
                            <p className="font-medium text-yellow-900">{ticket.clientId.name}</p>
                            <p className="text-sm text-yellow-700">{ticket.email}</p>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="space-y-1">
                            <p className="font-medium text-yellow-900">{ticket.eventId.title}</p>
                            <p className="text-sm text-yellow-700">{getTicketVariantsDisplay(ticket)}</p>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <div className="space-y-1">
                            <p className="font-semibold text-yellow-900">₹{ticket.totalAmount}</p>
                            <p className="text-sm text-yellow-700">{ticket.ticketCount} tickets</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(ticket.paymentStatus)} className="bg-yellow-500 text-yellow-900">
                            {ticket.paymentStatus}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <Badge variant={getStatusBadgeVariant(ticket.ticketStatus)} className="bg-yellow-500 text-yellow-900">
                            {ticket.ticketStatus}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col sm:flex-row gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedTicket(ticket)}
                                  className="border-yellow-500 text-yellow-800 hover:bg-yellow-300 w-full sm:w-auto"
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  View
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto bg-yellow-100 border-yellow-400/20">
                                <DialogHeader>
                                  <DialogTitle className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-yellow-600 to-yellow-800 bg-clip-text text-transparent">
                                    Ticket Details - {ticket.ticketId}
                                  </DialogTitle>
                                </DialogHeader>
                               
                                {selectedTicket && (
                                  <div className="space-y-6 mt-6">
                                    {/* Customer Information */}
                                    <div className="bg-gradient-to-r from-yellow-200/20 to-yellow-300/20 p-4 sm:p-6 rounded-lg border border-yellow-400/20">
                                      <h3 className="text-base sm:text-lg font-semibold mb-4 flex items-center gap-2 text-yellow-800">
                                        <User className="h-5 w-5" />
                                        Customer Information
                                      </h3>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="flex items-center gap-3">
                                          <img
                                            src={selectedTicket.clientId.profileImage}
                                            alt={selectedTicket.clientId.name}
                                            className="w-12 h-12 rounded-full object-cover border-2 border-yellow-400/20"
                                          />
                                          <div>
                                            <p className="font-semibold text-yellow-900">{selectedTicket.clientId.name}</p>
                                            <p className="text-sm text-yellow-700">Customer ID: {selectedTicket.clientId._id}</p>
                                          </div>
                                        </div>
                                        <div className="space-y-2">
                                          <p><strong>Email:</strong> {selectedTicket.email}</p>
                                          <p><strong>Phone:</strong> {selectedTicket.phone}</p>
                                        </div>
                                      </div>
                                    </div>
                                    {/* Event Information */}
                                    <div className="bg-gradient-to-r from-yellow-300/20 to-yellow-200/20 p-4 sm:p-6 rounded-lg border border-yellow-400/20">
                                      <h3 className="text-base sm:text-lg font-semibold mb-4 flex items-center gap-2 text-yellow-800">
                                        <Calendar className="h-5 w-5" />
                                        Event Information
                                      </h3>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                                        <div className="space-y-3">
                                          <div>
                                            <p className="font-semibold text-base sm:text-lg text-yellow-900">{selectedTicket.eventId.title}</p>
                                            <p className="text-yellow-700 text-sm sm:text-base">{selectedTicket.eventId.description}</p>
                                          </div>
                                          <div>
                                            <p><strong>Event ID:</strong> {selectedTicket.eventId._id}</p>
                                            <p><strong>Status:</strong>
                                              <Badge variant={getStatusBadgeVariant(selectedTicket.eventId.status)} className="ml-2 bg-yellow-500 text-yellow-900">
                                                {selectedTicket.eventId.status}
                                              </Badge>
                                            </p>
                                          </div>
                                          <div>
                                            <p><strong>Date:</strong> {selectedTicket.eventId.date.map(d => new Date(d).toLocaleDateString()).join(', ')}</p>
                                            <p><strong>Time:</strong> {new Date(selectedTicket.eventId.startTime).toLocaleTimeString()} - {new Date(selectedTicket.eventId.endTime).toLocaleTimeString()}</p>
                                          </div>
                                          {selectedTicket.eventId.address && (
                                            <div className="flex items-start gap-2">
                                              <MapPin className="h-4 w-4 mt-1 text-yellow-600" />
                                              <p className="text-sm text-yellow-700">{selectedTicket.eventId.address}</p>
                                            </div>
                                          )}
                                        </div>
                                        <div>
                                          {selectedTicket.eventId.posterImage && selectedTicket.eventId.posterImage.length > 0 && (
                                            <img
                                              src={selectedTicket.eventId.posterImage[0]}
                                              alt={selectedTicket.eventId.title}
                                              className="w-full h-48 object-cover rounded-lg border-2 border-yellow-400/20"
                                            />
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                    {/* Ticket & Payment Information */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                                      <div className="bg-gradient-to-br from-yellow-200/20 to-yellow-100 p-4 sm:p-6 rounded-lg border border-yellow-400/20">
                                        <h3 className="text-base sm:text-lg font-semibold mb-4 flex items-center gap-2 text-yellow-800">
                                          <Ticket className="h-5 w-5" />
                                          Ticket Information
                                        </h3>
                                        <div className="space-y-3">
                                          <p><strong>Ticket Count:</strong> {selectedTicket.ticketCount}</p>
                                          {selectedTicket.ticketVariants && selectedTicket.ticketVariants.length > 0 ? (
                                            <div className="space-y-2">
                                              <p><strong>Variants:</strong></p>
                                              {selectedTicket.ticketVariants.map((variant, index) => (
                                                <div key={index} className="p-2 bg-yellow-50 rounded">
                                                  <p><strong>{variant.variant}:</strong> {variant.count} tickets @ ₹{variant.pricePerTicket} = ₹{variant.subtotal}</p>
                                                </div>
                                              ))}
                                            </div>
                                          ) : (
                                            <p><strong>Ticket Variant:</strong> Standard</p>
                                          )}
                                          <p><strong>Total Amount:</strong> <span className="text-base sm:text-lg font-bold text-yellow-800">₹{selectedTicket.totalAmount}</span></p>
                                          <p><strong>Status:</strong>
                                            <Badge variant={getStatusBadgeVariant(selectedTicket.ticketStatus)} className="ml-2 bg-yellow-500 text-yellow-900">
                                              {selectedTicket.ticketStatus}
                                            </Badge>
                                          </p>
                                        </div>
                                      </div>
                                      <div className="bg-gradient-to-br from-yellow-300/20 to-yellow-100 p-4 sm:p-6 rounded-lg border border-yellow-400/20">
                                        <h3 className="text-base sm:text-lg font-semibold mb-4 flex items-center gap-2 text-yellow-800">
                                          <CreditCard className="h-5 w-5" />
                                          Payment Information
                                        </h3>
                                        <div className="space-y-3">
                                          <p><strong>Payment Status:</strong>
                                            <Badge variant={getStatusBadgeVariant(selectedTicket.paymentStatus)} className="ml-2 bg-yellow-500 text-yellow-900">
                                              {selectedTicket.paymentStatus}
                                            </Badge>
                                          </p>
                                          <p><strong>Transaction ID:</strong> <span className="font-mono text-sm bg-yellow-200/50 px-2 py-1 rounded">{selectedTicket.paymentTransactionId}</span></p>
                                        </div>
                                      </div>
                                    </div>
                                    {/* QR Code */}
                                    <div className="bg-gradient-to-r from-yellow-100 to-yellow-200/20 p-4 sm:p-6 rounded-lg border border-yellow-400/20 text-center">
                                      <h3 className="text-base sm:text-lg font-semibold mb-4 flex items-center justify-center gap-2 text-yellow-800">
                                        <QrCode className="h-5 w-5" />
                                        QR Code
                                      </h3>
                                      <div className="flex justify-center">
                                        <img
                                          src={selectedTicket.qrCodeLink}
                                          alt="Ticket QR Code"
                                          className="w-40 h-40 sm:w-48 sm:h-48 border border-yellow-400/20 rounded-lg"
                                        />
                                      </div>
                                      <p className="text-sm text-yellow-700 mt-2">
                                        Scan this QR code for ticket verification
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleScanTicket(ticket.ticketId, ticket.eventId._id)}
                              className="border-yellow-500 text-yellow-800 hover:bg-yellow-300 w-full sm:w-auto"
                            >
                              <QrCode className="h-4 w-4 mr-1" />
                              Scan
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>

            {/* Pagination Component */}
            {totalPages > 1 && (
              <div className="mt-8">
                <Pagination
                  total={totalPages}
                  current={pageNo}
                  setPage={setPageNo}
                />
              </div>
            )}
          </div>
        )}

        {tickets && tickets.length === 0 && !isLoading && (
          <Card className="p-8 text-center border-yellow-400/20 bg-yellow-200/10">
            <div className="space-y-3">
              <Ticket className="h-12 w-12 mx-auto text-yellow-700" />
              <h3 className="text-lg font-medium text-yellow-800">No tickets found</h3>
              <p className="text-yellow-700">
                {hasActiveFilters 
                  ? 'No tickets match your search or filter criteria. Try adjusting your filters.'
                  : 'No tickets found for your events. Check back later or create some events first.'}
              </p>
              {hasActiveFilters && (
                <Button
                  onClick={handleClearFilters}
                  variant="outline"
                  className="mt-4 border-yellow-500 text-yellow-800 hover:bg-yellow-300"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default TicketAndUserDetails;