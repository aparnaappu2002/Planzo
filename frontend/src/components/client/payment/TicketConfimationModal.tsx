import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Download, Mail, MapPin, Calendar, Clock, Ticket } from "lucide-react";
import { TicketBackendEntity } from "@/types/TicketBackendEntity";

interface TicketConfirmationModalProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  ticket: TicketBackendEntity;
}

export function TicketConfirmationModal({ isOpen, setIsOpen, ticket }: TicketConfirmationModalProps) {

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden bg-gradient-to-br from-background to-accent/20">
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
                Your ticket has been confirmed
              </p>
            </DialogHeader>
          </div>

          {/* Ticket Details */}
          <div className="p-8 space-y-6">
            <Card className="border-primary/20 shadow-accent">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  
                  <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
                    {ticket.ticketStatus}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                

                <div className="border-t border-border pt-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Ticket Status</p>
                      <p className="font-medium">{ticket.ticketStatus}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Quantity</p>
                      <p className="font-medium">{ticket.ticketCount}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Ticket ID</p>
                      <p className="font-medium font-mono text-xs">{ticket.ticketId}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total Amount</p>
                      <p className="font-bold text-lg text-primary">₹{ticket.totalAmount}</p>
                    </div>
                  </div>
                </div>

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
              </CardContent>
            </Card>

            {/* Action Buttons */}
            

            {/* Customer Info */}
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-1">Customer</p>
              <p className="text-sm text-muted-foreground">{ticket.email}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}