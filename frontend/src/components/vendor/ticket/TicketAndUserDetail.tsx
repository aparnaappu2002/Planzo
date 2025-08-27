import { useState } from "react";
import { useTicketDetailsWithUser } from "@/hooks/vendorCustomHooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, Ticket, Eye, Calendar, MapPin, User, CreditCard, QrCode, RefreshCw } from "lucide-react";
import { toast } from "react-toastify";
import { TicketAndUserDTO } from "@/types/TicketAndUserDTO";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/Store";
import Pagination from "@/components/other components/Pagination";

const TicketAndUserDetails = () => {
  const vendorId = useSelector((state: RootState) => state.vendorSlice.vendor?._id);
  const [pageNo, setPageNo] = useState(1);
  const [selectedTicket, setSelectedTicket] = useState<TicketAndUserDTO | null>(null);

  const { data, isLoading, error, refetch } = useTicketDetailsWithUser(vendorId, pageNo);
  
  // Extract tickets and totalPages from the response
  const tickets = data?.ticketAndEventDetails || [];
  const totalPages = data?.totalPages || 0;

  console.log("API Response:", data);
  console.log("Tickets:", tickets);
  console.log("Total Pages:", totalPages);

  const handleSearch = () => {
    if (!vendorId?.trim()) {
      toast.error("Missing vendor information. Please ensure you're logged in.");
      return;
    }
    refetch();
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-yellow-light/10 to-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-primary rounded-full">
              <Ticket className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Ticket Details
            </h1>
          </div>
          
        </div>

        
        

        {/* Content */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-3">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              <p className="text-muted-foreground">Loading ticket details...</p>
            </div>
          </div>
        )}

        {error && (
          <Card className="p-6 border-destructive/20 bg-destructive/5">
            <div className="text-center space-y-2">
              <p className="text-destructive font-medium">Error loading ticket details</p>
              <p className="text-sm text-muted-foreground">{error.message}</p>
              <Button
                onClick={() => refetch()}
                variant="outline"
                className="mt-4"
              >
                Try Again
              </Button>
            </div>
          </Card>
        )}

        {tickets && tickets.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">
                Ticket Details ({tickets.length} found)
              </h2>
            </div>
            
            <Card className="border-primary/20">
              <Table>
                <TableHeader>
                  <TableRow className="border-primary/10">
                    <TableHead>Ticket ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Payment Status</TableHead>
                    <TableHead>Ticket Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tickets.map((ticket) => (
                    <TableRow key={ticket._id} className="border-primary/5">
                      <TableCell className="font-medium">{ticket.ticketId}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium">{ticket.clientId.name}</p>
                          <p className="text-sm text-muted-foreground">{ticket.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium">{ticket.eventId.title}</p>
                          <p className="text-sm text-muted-foreground">{ticket.ticketVariant}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-semibold">₹{ticket.totalAmount}</p>
                          <p className="text-sm text-muted-foreground">{ticket.ticketCount} tickets</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(ticket.paymentStatus)}>
                          {ticket.paymentStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(ticket.ticketStatus)}>
                          {ticket.ticketStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedTicket(ticket)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                                Ticket Details - {ticket.ticketId}
                              </DialogTitle>
                            </DialogHeader>
                            
                            {selectedTicket && (
                              <div className="space-y-6 mt-6">
                                {/* Customer Information */}
                                <div className="bg-gradient-to-r from-primary/5 to-accent/5 p-6 rounded-lg border border-primary/20">
                                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    <User className="h-5 w-5" />
                                    Customer Information
                                  </h3>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-center gap-3">
                                      <img 
                                        src={selectedTicket.clientId.profileImage} 
                                        alt={selectedTicket.clientId.name}
                                        className="w-12 h-12 rounded-full object-cover border-2 border-primary/20"
                                      />
                                      <div>
                                        <p className="font-semibold">{selectedTicket.clientId.name}</p>
                                        <p className="text-sm text-muted-foreground">Customer ID: {selectedTicket.clientId._id}</p>
                                      </div>
                                    </div>
                                    <div className="space-y-2">
                                      <p><strong>Email:</strong> {selectedTicket.email}</p>
                                      <p><strong>Phone:</strong> {selectedTicket.phone}</p>
                                    </div>
                                  </div>
                                </div>

                                {/* Event Information */}
                                <div className="bg-gradient-to-r from-accent/5 to-primary/5 p-6 rounded-lg border border-primary/20">
                                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    <Calendar className="h-5 w-5" />
                                    Event Information
                                  </h3>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                      <div>
                                        <p className="font-semibold text-lg">{selectedTicket.eventId.title}</p>
                                        <p className="text-muted-foreground">{selectedTicket.eventId.description}</p>
                                      </div>
                                      <div>
                                        <p><strong>Event ID:</strong> {selectedTicket.eventId._id}</p>
                                        <p><strong>Status:</strong> 
                                          <Badge variant={getStatusBadgeVariant(selectedTicket.eventId.status)} className="ml-2">
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
                                          <MapPin className="h-4 w-4 mt-1 text-primary" />
                                          <p className="text-sm">{selectedTicket.eventId.address}</p>
                                        </div>
                                      )}
                                    </div>
                                    <div>
                                      {selectedTicket.eventId.posterImage && selectedTicket.eventId.posterImage.length > 0 && (
                                        <img 
                                          src={selectedTicket.eventId.posterImage[0]} 
                                          alt={selectedTicket.eventId.title}
                                          className="w-full h-48 object-cover rounded-lg border-2 border-primary/20"
                                        />
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* Ticket & Payment Information */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div className="bg-gradient-to-br from-primary/5 to-background p-6 rounded-lg border border-primary/20">
                                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                      <Ticket className="h-5 w-5" />
                                      Ticket Information
                                    </h3>
                                    <div className="space-y-3">
                                      <p><strong>Ticket Variant:</strong> {selectedTicket.ticketVariant}</p>
                                      <p><strong>Ticket Count:</strong> {selectedTicket.ticketCount}</p>
                                      <p><strong>Price per Ticket:</strong> ₹{selectedTicket.eventId.pricePerTicket}</p>
                                      <p><strong>Total Amount:</strong> <span className="text-lg font-bold text-primary">₹{selectedTicket.totalAmount}</span></p>
                                      <p><strong>Status:</strong> 
                                        <Badge variant={getStatusBadgeVariant(selectedTicket.ticketStatus)} className="ml-2">
                                          {selectedTicket.ticketStatus}
                                        </Badge>
                                      </p>
                                    </div>
                                  </div>

                                  <div className="bg-gradient-to-br from-accent/5 to-background p-6 rounded-lg border border-primary/20">
                                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                      <CreditCard className="h-5 w-5" />
                                      Payment Information
                                    </h3>
                                    <div className="space-y-3">
                                      <p><strong>Payment Status:</strong> 
                                        <Badge variant={getStatusBadgeVariant(selectedTicket.paymentStatus)} className="ml-2">
                                          {selectedTicket.paymentStatus}
                                        </Badge>
                                      </p>
                                      <p><strong>Transaction ID:</strong> <span className="font-mono text-sm bg-muted px-2 py-1 rounded">{selectedTicket.paymentTransactionId}</span></p>
                                    </div>
                                  </div>
                                </div>

                                {/* QR Code */}
                                <div className="bg-gradient-to-r from-background to-primary/5 p-6 rounded-lg border border-primary/20 text-center">
                                  <h3 className="text-lg font-semibold mb-4 flex items-center justify-center gap-2">
                                    <QrCode className="h-5 w-5" />
                                    QR Code
                                  </h3>
                                  <div className="flex justify-center">
                                    <img 
                                      src={selectedTicket.qrCodeLink} 
                                      alt="Ticket QR Code"
                                      className="w-48 h-48 border border-primary/20 rounded-lg"
                                    />
                                  </div>
                                  <p className="text-sm text-muted-foreground mt-2">
                                    Scan this QR code for ticket verification
                                  </p>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>

            {/* Pagination Component */}
            <div className="mt-8">
              <Pagination 
                total={totalPages} 
                current={pageNo} 
                setPage={setPageNo} 
              />
            </div>
          </div>
        )}

        {tickets && tickets.length === 0 && !isLoading && (
          <Card className="p-8 text-center border-muted">
            <div className="space-y-3">
              <Ticket className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="text-lg font-medium">No tickets found</h3>
              <p className="text-muted-foreground">
                No tickets found for your events. Check back later or create some events first.
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default TicketAndUserDetails;