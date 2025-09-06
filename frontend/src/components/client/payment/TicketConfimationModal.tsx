import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Download, Mail, MapPin, Calendar, Clock, Ticket, QrCode } from "lucide-react";

interface TicketVariant {
  type: string;
  count: number;
  subtotal: number;
  qrCodes: number;
}

interface TicketDetails {
  ticketId: string;
  totalAmount: number;
  totalTickets: number;
  variants: TicketVariant[];
  paymentStatus: string;
  ticketStatus: string;
}

interface ConfirmedTicket {
  _id: string;
  ticketId: string;
  clientId: string;
  email: string;
  eventId: string;
  phone?: string;
  qrCodeLink?: string;
  ticketVariants?: Array<{
    variant: string;
    count: number;
    subtotal: number;
    qrCodes: Array<{
      qrId: string;
      qrCodeLink: string;
      status: string;
    }>;
  }>;
  totalAmount: number;
  ticketCount: number;
  paymentStatus: string;
  ticketStatus: string;
}

interface ConfirmationResponse {
  message: string;
  confirmedTicket: ConfirmedTicket;
  ticketDetails: TicketDetails;
}

interface TicketConfirmationModalProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  confirmationData?: ConfirmationResponse; // Make it optional
}

export function TicketConfirmationModal({ 
  isOpen, 
  setIsOpen, 
  confirmationData
}: TicketConfirmationModalProps) {
  
  // Early return if no confirmation data
  if (!confirmationData || !confirmationData.confirmedTicket || !confirmationData.ticketDetails) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md">
          <div className="text-center p-6">
            <p className="text-muted-foreground">Loading ticket confirmation...</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
  
  const { confirmedTicket, ticketDetails } = confirmationData;
  
  // Safety checks
  if (!ticketDetails.variants || !Array.isArray(ticketDetails.variants)) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md">
          <div className="text-center p-6">
            <p className="text-muted-foreground">Invalid ticket data</p>
            <Button onClick={() => setIsOpen(false)} className="mt-4">Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
  
  const isMultipleTickets = ticketDetails.totalTickets > 1;
  const hasMultipleVariants = ticketDetails.variants.length > 1;
  
  // Get total QR codes count
  const totalQRCodes = ticketDetails.variants.reduce((sum, v) => sum + v.qrCodes, 0);
  
  // Helper functions
  const handleDownloadQRCodes = () => {
    if (confirmedTicket.ticketVariants) {
      console.log('Downloading QR codes for variants:', confirmedTicket.ticketVariants.map(v => ({
        variant: v.variant,
        qrCodes: v.qrCodes.length
      })));
      
      // You can implement download logic here
      // For example, create a ZIP file with all QR codes
      confirmedTicket.ticketVariants.forEach((variant) => {
        variant.qrCodes.forEach((qr, index) => {
          console.log(`QR Code ${index + 1} for ${variant.variant}:`, qr.qrCodeLink);
          // Download logic here
        });
      });
    }
  };

  const handleEmailTickets = () => {
    console.log('Resending tickets to:', confirmedTicket.email);
    console.log('Ticket details to send:', {
      ticketId: confirmedTicket.ticketId,
      variants: ticketDetails.variants,
      totalAmount: ticketDetails.totalAmount
    });
    // Email sending logic here
  };

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
                  ? `${ticketDetails.totalTickets} tickets have been confirmed` 
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
                    {ticketDetails.ticketStatus}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Ticket Variants Breakdown */}
                <div className="bg-accent/30 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-sm text-muted-foreground">Ticket Breakdown</h4>
                    <div className="flex items-center gap-2">
                      <QrCode className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">{totalQRCodes} QR Codes</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {ticketDetails.variants.map((variant) => (
                      <div key={variant.type} className="flex justify-between items-center p-3 bg-background/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Ticket className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium capitalize">{variant.type} Tickets</p>
                            <p className="text-sm text-muted-foreground">
                              ₹{(variant.subtotal / variant.count).toFixed(0)} each
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline">{variant.count} ticket{variant.count > 1 ? 's' : ''}</Badge>
                            <Badge variant="secondary" size="sm">{variant.qrCodes} QR</Badge>
                          </div>
                          <p className="text-sm font-semibold">₹{variant.subtotal}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Total Summary */}
                  <div className="mt-4 pt-4 border-t border-border/50">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">Total</span>
                        <Badge variant="default">{ticketDetails.totalTickets} tickets</Badge>
                      </div>
                      <span className="font-bold text-xl text-primary">₹{ticketDetails.totalAmount}</span>
                    </div>
                  </div>
                </div>

                {/* Payment & Ticket Status */}
                <div className="border-t border-border pt-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Payment Status</p>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-success rounded-full"></div>
                        <p className="font-medium capitalize text-success">{ticketDetails.paymentStatus}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Ticket Status</p>
                      <p className="font-medium capitalize">{ticketDetails.ticketStatus}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-muted-foreground">Ticket ID</p>
                      <p className="font-medium font-mono text-xs break-all">{ticketDetails.ticketId}</p>
                    </div>
                  </div>
                </div>

                {/* Primary QR Code Section */}
                {confirmedTicket.qrCodeLink && (
                  <div className="border-t border-border pt-4">
                    <div className="bg-accent/30 rounded-lg p-4 text-center">
                      <h4 className="font-medium mb-3 text-sm text-muted-foreground">Primary QR Code</h4>
                      <div className="w-32 h-32 mx-auto mb-3 rounded-lg flex items-center justify-center border border-primary/20 bg-white p-2 shadow-sm">
                        <img 
                          src={confirmedTicket.qrCodeLink} 
                          alt="Primary QR Code for ticket verification" 
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {isMultipleTickets 
                          ? 'Main ticket QR code'
                          : 'Show this QR code at the event entrance'
                        }
                      </p>
                    </div>
                  </div>
                )}

                {/* Individual QR Codes Preview (if available) */}
                {confirmedTicket.ticketVariants && confirmedTicket.ticketVariants.length > 0 && (
                  <div className="border-t border-border pt-4">
                    <div className="bg-accent/20 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-sm text-muted-foreground">Individual QR Codes</h4>
                        <Badge variant="outline">{totalQRCodes} codes generated</Badge>
                      </div>
                      
                      <div className="space-y-3 max-h-48 overflow-y-auto">
                        {confirmedTicket.ticketVariants.map((variant) => (
                          <div key={variant.variant} className="border border-border/50 rounded-lg p-3">
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-medium capitalize">{variant.variant} Tickets</span>
                              <Badge variant="secondary">{variant.qrCodes.length} QR codes</Badge>
                            </div>
                            
                            {variant.qrCodes.length <= 3 ? (
                              // Show QR codes if 3 or fewer
                              <div className="grid grid-cols-3 gap-2">
                                {variant.qrCodes.map((qr, index) => (
                                  <div key={qr.qrId} className="text-center">
                                    <div className="w-16 h-16 mx-auto mb-1 rounded border border-primary/20 bg-white p-1">
                                      <img 
                                        src={qr.qrCodeLink} 
                                        alt={`QR Code ${index + 1}`}
                                        className="w-full h-full object-contain"
                                      />
                                    </div>
                                    <p className="text-xs text-muted-foreground">#{index + 1}</p>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              // Show summary if more than 3
                              <div className="text-center py-3">
                                <QrCode className="w-8 h-8 mx-auto mb-2 text-primary" />
                                <p className="text-sm text-muted-foreground">
                                  {variant.qrCodes.length} QR codes generated
                                </p>
                                
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                
              </CardContent>
            </Card>

            {/* Action Buttons */}
           

            {/* Customer Info */}
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-2">Customer Details</p>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <p className="font-medium">{confirmedTicket.email}</p>
                </div>
                {confirmedTicket.phone && (
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-muted-foreground">{confirmedTicket.phone}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Transaction Summary */}
            <Card className="bg-gradient-to-r from-success/5 to-success/10 border-success/20">
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-muted-foreground">Transaction Complete</p>
                    <p className="font-semibold text-success">₹{ticketDetails.totalAmount} paid successfully</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Payment Status</p>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                      <p className="font-medium text-success capitalize">{ticketDetails.paymentStatus}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            
            
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}