import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  IndianRupee,
  Ticket,
  Calendar,
  MapPin,
  Clock,
  Users,
  Minus,
  Plus,
  CreditCard,
  ShoppingCart,
  AlertCircle,
  CheckCircle,
  User,
  Mail,
  Phone
} from "lucide-react";
// Import PaymentMethodModal component
import PaymentMethodModal from './PaymentMethod';
import { RootState } from '@/redux/Store';
import { useSelector } from 'react-redux';

// Validation function
const validateContactInfo = (email, phone) => {
  const errors = {};
  
  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) {
    errors.email = 'Email is required';
  } else if (!emailRegex.test(email)) {
    errors.email = 'Please enter a valid email address';
  }
  
  // Phone validation
  const phoneRegex = /^[0-9]{10}$/;
  if (!phone) {
    errors.phone = 'Phone number is required';
  } else if (!phoneRegex.test(phone.replace(/\s+/g, ''))) {
    errors.phone = 'Please enter a valid 10-digit phone number';
  }
  
  return errors;
};


const TicketPurchaseModal = ({ event, isOpen, onOpenChange, children }) => {
  const navigate = useNavigate();
  const [ticketQuantity, setTicketQuantity] = useState(1);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [errors, setErrors] = useState({});
  const [paymentMethod, setPaymentMethod] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [purchaseComplete, setPurchaseComplete] = useState(false);
  const [showChoosePaymentModal, setShowChoosePaymentModal] = useState(false);
  const clientId = useSelector((state: RootState) => state.clientSlice.client?._id)

  const availableTickets = event.totalTicket - event.ticketPurchased;
  const totalAmount = (event.pricePerTicket || 0) * ticketQuantity;
  const serviceFee = totalAmount > 0 ? Math.max(10, totalAmount * 0.02) : 0;
  const finalAmount = totalAmount + serviceFee;

  const handleQuantityChange = (change) => {
    const newQuantity = Math.max(1, Math.min(ticketQuantity + change, Math.min(availableTickets, event.maxTicketsPerUser)));
    setTicketQuantity(newQuantity);
  };

  const handleInputChange = (field, value) => {
    setCustomerInfo(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const onSelectPaymentMethod = (selectedPaymentMethod) => {
    setPaymentMethod(selectedPaymentMethod);
    setShowChoosePaymentModal(false);
    
    if (selectedPaymentMethod === 'stripe') {
      handlePayment();
    } else if (selectedPaymentMethod === 'wallet') {
      handleWalletPayment();
    }
  };

  const handleWalletPayment = () => {
    const validationErrors = validateContactInfo(customerInfo.email, customerInfo.phone);
    setErrors(validationErrors);
    
    if (Object.keys(validationErrors).length > 0) {
      return; // ❌ Stop if there are validation errors
    }

    const ticketPaymentData = {
      clientId: clientId!,
      email: customerInfo.email,
      phone: customerInfo.phone,
      eventId: event._id!,
    };

    navigate('/ticketPaymentWallet', {
      state: {
        amount: event.pricePerTicket * ticketQuantity,
        ticketData: ticketPaymentData,
        type: 'ticketBooking',
        totalTicketCount: ticketQuantity,
        vendorId: event.hostedBy,
      }
    });
  };

  const handlePayment = () => {
    const validationErrors = validateContactInfo(customerInfo.email, customerInfo.phone);
    setErrors(validationErrors);
    
    if (Object.keys(validationErrors).length > 0) {
      return; 
    }

    const ticketPaymentData = {
      clientId: clientId,
      email: customerInfo.email,
      phone: customerInfo.phone,
      eventId: event._id,
    };

    navigate('/ticketPayment', {
      state: {
        amount: event.pricePerTicket * ticketQuantity,
        ticketData: ticketPaymentData,
        type: 'ticketBooking',
        totalTicketCount: ticketQuantity,
        vendorId: event.hostedBy
      }
    });
    
    onOpenChange(false);
  };

  const handlePurchase = async () => {
    if (totalAmount > 0) {
      // Show payment method selection for paid tickets
      setShowChoosePaymentModal(true);
    } else {
      // Process free tickets directly
      processPurchase();
    }
  };

  const processPurchase = () => {
    const validationErrors = validateContactInfo(customerInfo.email, customerInfo.phone);
    setErrors(validationErrors);
    
    if (Object.keys(validationErrors).length > 0) {
      return; // ❌ Stop if there are validation errors
    }

    setIsProcessing(true);
    
    // Simulate API call for free tickets
    setTimeout(() => {
      setIsProcessing(false);
      setPurchaseComplete(true);
    }, 2000);
  };

  const isFormValid = customerInfo.name && customerInfo.email && customerInfo.phone && Object.keys(errors).length === 0;

  const formatDate = (dateString) => {
    if (!dateString) return 'Date TBA';
    const date = Array.isArray(dateString) ? dateString[0] : dateString;
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'Time TBA';
    return new Date(timeString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  if (purchaseComplete) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <div className="text-center py-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-green-600 mb-2">Purchase Successful!</h2>
            <p className="text-gray-600 mb-4">
              Your tickets have been confirmed. Check your email for details.
            </p>
            <div className="bg-green-50 p-4 rounded-lg mb-4">
              <p className="text-sm text-green-700">
                <strong>{ticketQuantity} ticket{ticketQuantity > 1 ? 's' : ''}</strong> for <strong>{event.title}</strong>
              </p>
              <p className="text-xs text-green-600 mt-1">
                Confirmation sent to {customerInfo.email}
              </p>
            </div>
            <Button 
              onClick={() => {
                setPurchaseComplete(false);
                onOpenChange(false);
              }}
              className="w-full"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        {children && <DialogTrigger asChild>{children}</DialogTrigger>}
        
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900">
              Purchase Tickets
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Event Summary */}
            <Card className="bg-yellow-50 border-yellow-200">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg text-gray-900 mb-2">
                      {event.title}
                    </CardTitle>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(event.date)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{formatTime(event.startTime)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{event.venueName}</span>
                      </div>
                    </div>
                  </div>
                  <Badge className="bg-yellow-200 text-yellow-800 ml-4">
                    {event.category}
                  </Badge>
                </div>
              </CardHeader>
            </Card>

            {/* Ticket Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ticket className="w-5 h-5" />
                  Select Tickets
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="font-medium">
                      {event.pricePerTicket ? `₹${event.pricePerTicket}` : 'Free'} per ticket
                    </p>
                    <p className="text-sm text-gray-600">
                      {availableTickets} tickets available • Max {event.maxTicketsPerUser} per person
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuantityChange(-1)}
                      disabled={ticketQuantity <= 1}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="w-8 text-center font-medium">{ticketQuantity}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuantityChange(1)}
                      disabled={ticketQuantity >= Math.min(availableTickets, event.maxTicketsPerUser)}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Availability Warning */}
                {availableTickets < 10 && (
                  <div className="flex items-center gap-2 p-3 bg-orange-50 text-orange-700 rounded-lg text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>Only {availableTickets} tickets left!</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name" className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Full Name *
                    </Label>
                    <Input
                      id="name"
                      value={customerInfo.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Enter your full name"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email Address *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={customerInfo.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="Enter your email"
                      className={`mt-1 ${errors.email ? 'border-red-500' : ''}`}
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                    )}
                  </div>
                </div>
                <div>
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Phone Number *
                  </Label>
                  <Input
                    id="phone"
                    value={customerInfo.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="Enter your phone number"
                    className={`mt-1 ${errors.phone ? 'border-red-500' : ''}`}
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>{ticketQuantity} × Ticket{ticketQuantity > 1 ? 's' : ''}</span>
                  <span>₹{totalAmount.toFixed(2)}</span>
                </div>
                {serviceFee > 0 && (
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Service Fee</span>
                    <span>₹{serviceFee.toFixed(2)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="flex items-center">
                    <IndianRupee className="w-4 h-4 mr-1" />
                    {finalAmount.toFixed(2)}
                  </span>
                </div>
                {totalAmount === 0 && (
                  <p className="text-sm text-green-600 text-center">
                    This is a free event!
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-3">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button 
              onClick={handlePurchase}
              disabled={!isFormValid || isProcessing}
              className="w-full sm:flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
            >
              {isProcessing ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                  Processing...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4" />
                  {totalAmount > 0 ? `Pay ₹${finalAmount.toFixed(2)}` : 'Get Free Tickets'}
                </div>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Method Modal */}
      {showChoosePaymentModal && (
        <PaymentMethodModal 
          isOpen={showChoosePaymentModal} 
          onClose={() => setShowChoosePaymentModal(false)} 
          onSelectPaymentMethod={onSelectPaymentMethod}
          ticketPrice={`₹${finalAmount.toFixed(2)}`}
        />
      )}
    </>
  );
};

export default TicketPurchaseModal;