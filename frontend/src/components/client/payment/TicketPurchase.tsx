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
  Phone,
  Crown,
  Gem,
  Shield
} from "lucide-react";
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
  
  // Store selected variants by type: variantType -> quantity
  const [selectedTicketVariants, setSelectedTicketVariants] = useState<{[key: string]: number}>({});
  
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
  
  const clientId = useSelector((state: RootState) => state.clientSlice.client?._id);

  // Helper functions for ticket variants
  const getTicketTypeIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'vip': return <Crown className="w-4 h-4" />;
      case 'premium': return <Gem className="w-4 h-4" />;
      case 'standard': return <Shield className="w-4 h-4" />;
      default: return <Ticket className="w-4 h-4" />;
    }
  };

  const getTicketTypeColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'vip': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'premium': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'standard': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Calculate totals - REMOVED SERVICE FEE
  const calculateTotals = () => {
    let totalQuantity = 0;
    let totalAmount = 0;
    
    // Iterate through selected variants using variant types
    Object.entries(selectedTicketVariants).forEach(([variantType, quantity]) => {
      const variant = event.ticketVariants?.find(v => v.type.toLowerCase() === variantType.toLowerCase());
      if (variant && quantity > 0) {
        totalQuantity += quantity;
        totalAmount += variant.price * quantity;
      }
    });
    
    // REMOVED: Service fee calculation
    // const serviceFee = totalAmount > 0 ? Math.max(10, totalAmount * 0.02) : 0;
    // const finalAmount = totalAmount + serviceFee;
    
    // Final amount is now just the total amount without any additional fees
    const finalAmount = totalAmount;
    
    return { totalQuantity, totalAmount, finalAmount };
  };

  const { totalQuantity, totalAmount, finalAmount } = calculateTotals();

  const handleVariantQuantityChange = (variantType: string, change: number) => {
    const variant = event.ticketVariants?.find(v => v.type.toLowerCase() === variantType.toLowerCase());
    if (!variant) {
      console.error('Variant not found:', variantType);
      return;
    }

    const currentQuantity = selectedTicketVariants[variantType] || 0;
    const availableForVariant = variant.totalTickets - variant.ticketsSold;
    const maxForVariant = Math.min(availableForVariant, variant.maxPerUser);
    
    const newQuantity = Math.max(0, Math.min(currentQuantity + change, maxForVariant));
    
    setSelectedTicketVariants(prev => {
      if (newQuantity === 0) {
        // Remove the variant if quantity is 0
        const { [variantType]: removed, ...rest } = prev;
        return rest;
      } else {
        return {
          ...prev,
          [variantType]: newQuantity
        };
      }
    });

    console.log(`Updated variant ${variantType} quantity to:`, newQuantity);
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

  // Prepare ticket data for backend (using variant types as keys)
  const prepareTicketData = () => {
    console.log('=== PREPARING TICKET DATA FOR BACKEND ===');
    console.log('selectedTicketVariants:', selectedTicketVariants);
    console.log('event.ticketVariants:', event.ticketVariants);
    
    // Validate that we have selections
    const hasSelections = Object.values(selectedTicketVariants).some(quantity => quantity > 0);
    if (!hasSelections) {
      console.error('No ticket variants selected');
      return null;
    }

    // Prepare the ticket data structure expected by backend
    const ticketData = {
      clientId: clientId!,
      email: customerInfo.email,
      phone: customerInfo.phone,
      eventId: event._id!,
      ticketVariants: selectedTicketVariants // This is already in the format: { variantType: quantity }
    };

    console.log('Final prepared ticket data:', ticketData);
    console.log('==========================================');
    
    return ticketData;
  };

  const handleWalletPayment = () => {
    const validationErrors = validateContactInfo(customerInfo.email, customerInfo.phone);
    setErrors(validationErrors);
    
    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    const ticketData = prepareTicketData();
    
    if (!ticketData) {
      console.error('No valid ticket data prepared');
      return;
    }

    const navigationData = {
      amount: finalAmount, // No service fee included
      ticketData: ticketData,
      type: 'ticketBooking',
      totalTicketCount: totalQuantity,
      vendorId: event.hostedBy,
    };

    console.log('Wallet payment navigation data:', navigationData);

    navigate('/ticketPaymentWallet', {
      state: navigationData
    });
  };

  const handlePayment = () => {
    const validationErrors = validateContactInfo(customerInfo.email, customerInfo.phone);
    setErrors(validationErrors);
    
    if (Object.keys(validationErrors).length > 0) {
      return; 
    }

    const ticketData = prepareTicketData();
    
    if (!ticketData) {
      console.error('No valid ticket data prepared');
      return;
    }

    const navigationData = {
      amount: finalAmount, // No service fee included
      ticketData: ticketData,
      type: 'ticketBooking',
      totalTicketCount: totalQuantity,
      vendorId: event.hostedBy
    };

    console.log('Stripe payment navigation data:', navigationData);

    navigate('/ticketPayment', {
      state: navigationData
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
      return;
    }

    setIsProcessing(true);
    
    // Simulate API call for free tickets
    setTimeout(() => {
      setIsProcessing(false);
      setPurchaseComplete(true);
    }, 2000);
  };

  const isFormValid = customerInfo.name && customerInfo.email && customerInfo.phone && 
                     Object.keys(errors).length === 0 && totalQuantity > 0;

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
                <strong>{totalQuantity} ticket{totalQuantity > 1 ? 's' : ''}</strong> for <strong>{event.title}</strong>
              </p>
              <p className="text-xs text-green-600 mt-1">
                Confirmation sent to {customerInfo.email}
              </p>
            </div>
            <Button 
              onClick={() => {
                setPurchaseComplete(false);
                onOpenChange(false);
                setSelectedTicketVariants({});
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
        
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
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

            {/* Ticket Variants Selection */}
            {event.ticketVariants && event.ticketVariants.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Ticket className="w-5 h-5" />
                    Select Ticket Types
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    You can select multiple ticket types and quantities
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {event.ticketVariants.map((variant, index) => {
                      const availableForVariant = variant.totalTickets - variant.ticketsSold;
                      const selectedQuantity = selectedTicketVariants[variant.type] || 0;
                      const maxSelectable = Math.min(availableForVariant, variant.maxPerUser);
                      
                      return (
                        <Card key={variant._id || index} className={`border-2 ${getTicketTypeColor(variant.type)}`}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  {getTicketTypeIcon(variant.type)}
                                  <h4 className="font-semibold capitalize">{variant.type}</h4>
                                  <Badge variant="outline" className="text-xs ml-2">
                                    {availableForVariant}/{variant.totalTickets} available
                                  </Badge>
                                </div>
                                
                                <p className="text-sm text-gray-600 mb-2">{variant.description}</p>
                                
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-lg font-bold text-gray-900">₹{variant.price}</span>
                                  <span className="text-sm text-gray-500">Max {variant.maxPerUser} per person</span>
                                </div>
                                
                                {variant.benefits && variant.benefits.length > 0 && (
                                  <div className="mb-3">
                                    <p className="text-xs font-medium text-gray-700 mb-1">Benefits:</p>
                                    <ul className="text-xs text-gray-600 space-y-1">
                                      {variant.benefits.map((benefit, idx) => (
                                        <li key={idx} className="flex items-center gap-1">
                                          <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                                          {benefit}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                
                                {availableForVariant < 10 && availableForVariant > 0 && (
                                  <div className="flex items-center gap-2 p-2 bg-orange-50 text-orange-700 rounded text-xs">
                                    <AlertCircle className="w-3 h-3" />
                                    <span>Only {availableForVariant} left!</span>
                                  </div>
                                )}
                                
                                {availableForVariant === 0 && (
                                  <Badge className="w-full justify-center bg-red-100 text-red-800">
                                    Sold Out
                                  </Badge>
                                )}
                                
                                {selectedQuantity > 0 && (
                                  <div className="mt-2 p-2 bg-green-50 rounded text-xs text-green-700">
                                    Selected: {selectedQuantity} × ₹{variant.price} = ₹{selectedQuantity * variant.price}
                                  </div>
                                )}
                              </div>
                              
                              {availableForVariant > 0 && (
                                <div className="flex items-center gap-3 ml-4">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleVariantQuantityChange(variant.type, -1)}
                                    disabled={selectedQuantity <= 0}
                                  >
                                    <Minus className="w-4 h-4" />
                                  </Button>
                                  <span className="w-8 text-center font-medium">{selectedQuantity}</span>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleVariantQuantityChange(variant.type, 1)}
                                    disabled={selectedQuantity >= maxSelectable}
                                  >
                                    <Plus className="w-4 h-4" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                  
                  {totalQuantity === 0 && (
                    <div className="text-center py-4 text-gray-500">
                      <Ticket className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>Please select at least one ticket to continue</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              // Fallback for events without ticket variants
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Ticket className="w-5 h-5" />
                    Select Tickets
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-4 text-gray-500">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                    <p>No ticket variants available for this event</p>
                  </div>
                </CardContent>
              </Card>
            )}

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
            {totalQuantity > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Order Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Selected tickets breakdown */}
                  {Object.entries(selectedTicketVariants)
                    .filter(([_, quantity]) => quantity > 0)
                    .map(([variantType, quantity]) => {
                      const variant = event.ticketVariants?.find(v => v.type.toLowerCase() === variantType.toLowerCase());
                      if (!variant) return null;
                      
                      return (
                        <div key={variantType} className="flex justify-between">
                          <span className="flex items-center gap-2">
                            {getTicketTypeIcon(variant.type)}
                            {quantity} × {variant.type.charAt(0).toUpperCase() + variant.type.slice(1)} Ticket{quantity > 1 ? 's' : ''}
                          </span>
                          <span>₹{(variant.price * quantity).toFixed(2)}</span>
                        </div>
                      );
                    })}
                  
                  <Separator />
                  
                  {/* REMOVED: Service fee display */}
                  
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total ({totalQuantity} ticket{totalQuantity > 1 ? 's' : ''})</span>
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
            )}
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-3">
            <Button 
              variant="outline" 
              onClick={() => {
                onOpenChange(false);
                setSelectedTicketVariants({});
              }}
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