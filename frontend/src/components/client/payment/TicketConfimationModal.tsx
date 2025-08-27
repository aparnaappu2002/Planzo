import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Download, Mail, MapPin, Calendar, Clock, Ticket } from "lucide-react";
import { TicketBackendEntity } from "@/types/TicketBackendEntity";

interface TicketConfirmationModalProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  ticket: TicketBackendEntity; // Primary ticket for display
  totalTickets?: number; // Total number of tickets confirmed
  allTickets?: TicketBackendEntity[]; // All confirmed tickets (optional)
}

export function TicketConfirmationModal({ 
  isOpen, 
  setIsOpen, 
  ticket, 
  totalTickets = 1,
  allTickets = []
}: TicketConfirmationModalProps) {
  
  // Calculate total amount if multiple tickets
  const calculateTotalAmount = () => {
    if (allTickets.length > 0) {
      return allTickets.reduce((sum, t) => sum + (t.totalAmount || 0), 0);
    }
    return ticket.totalAmount || 0;
  };

  // Get ticket variants summary
  const getTicketVariantsSummary = () => {
    if (allTickets.length <= 1) return null;
    
    const variantCounts = allTickets.reduce((acc, t) => {
      const variant = t.ticketVariant || 'standard';
      acc[variant] = (acc[variant] || 0) + (t.ticketCount || 1);
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(variantCounts).map(([variant, count]) => ({
      variant,
      count
    }));
  };

  const variantsSummary = getTicketVariantsSummary();
  const totalAmount = calculateTotalAmount();
  const isMultipleTickets = totalTickets > 1;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0 overflow-y-auto bg-gradient-to-br from-background to-accent/20">
        <div className="relative">
          {/* Success Header */}
          <div className="bg-gradient-to-r from-primary to-warning p-8 text-center">
            <div className="mx-auto w-16 h-16 bg-success rounded-full flex items-center justify-center mb-4 shadow-lg">
              <CheckCircle className="w-8 h-8 text-success-foreground" />
            </div>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-primary-foreground mb-2">
                Payment Successful!
              </DialogTitle>
              <p className="text-primary-foreground/90 text-lg">
                {isMultipleTickets 
                  ? `${totalTickets} tickets have been confirmed` 
                  : 'Your ticket has been confirmed'
                }
              </p>
            </DialogHeader>
          </div>

          {/* Ticket Details */}
          <div className="p-8 space-y-6">
            <Card className="border-primary/20 shadow-accent">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Ticket className="w-5 h-5 text-primary" />
                    <CardTitle className="text-lg">
                      {isMultipleTickets ? 'Tickets Confirmed' : 'Ticket Confirmed'}
                    </CardTitle>
                  </div>
                  <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
                    {ticket.ticketStatus}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Multiple Tickets Summary */}
                {isMultipleTickets && variantsSummary && (
                  <div className="bg-accent/30 rounded-lg p-4">
                    <h4 className="font-medium mb-3 text-sm text-muted-foreground">Ticket Breakdown</h4>
                    <div className="space-y-2">
                      {variantsSummary.map(({ variant, count }) => (
                        <div key={variant} className="flex justify-between items-center">
                          <span className="capitalize font-medium">{variant} Tickets</span>
                          <Badge variant="outline">{count} ticket{count > 1 ? 's' : ''}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="border-t border-border pt-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Status</p>
                      <p className="font-medium capitalize">{ticket.ticketStatus}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total Quantity</p>
                      <p className="font-medium">{totalTickets} ticket{totalTickets > 1 ? 's' : ''}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Primary Ticket ID</p>
                      <p className="font-medium font-mono text-xs">{ticket.ticketId}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total Amount</p>
                      <p className="font-bold text-lg text-primary">₹{totalAmount}</p>
                    </div>
                  </div>
                </div>

                {/* QR Code Section */}
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
                        {isMultipleTickets 
                          ? 'Primary QR code - All tickets will be sent via email'
                          : 'Show this QR code at the event entrance'
                        }
                      </p>
                    </div>
                  </div>
                )}

                {/* Multiple Tickets Notice */}
                {isMultipleTickets && (
                  <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                          Multiple Tickets Confirmed
                        </h4>
                        <p className="text-sm text-blue-700 dark:text-blue-200">
                          All {totalTickets} tickets with individual QR codes have been sent to your email address. 
                          Each ticket has its own unique QR code for entry.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Action Buttons */}
            

            {/* Customer Info */}
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-1">Customer Details</p>
              <div className="space-y-1">
                <p className="font-medium">{ticket.email}</p>
                {ticket.phone && (
                  <p className="text-sm text-muted-foreground">{ticket.phone}</p>
                )}
              </div>
            </div>

            {/* Additional Info for Multiple Tickets */}
            {isMultipleTickets && allTickets.length > 0 && (
              <div className="bg-accent/20 rounded-lg p-4">
                <h4 className="font-medium mb-3 text-sm text-muted-foreground">All Ticket IDs</h4>
                <div className="space-y-1 max-h-24 overflow-y-auto">
                  {allTickets.map((t, index) => (
                    <div key={t.ticketId} className="flex justify-between items-center text-xs">
                      <span className="font-mono">{t.ticketId}</span>
                      <Badge variant="outline" size="sm">{t.ticketVariant}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}