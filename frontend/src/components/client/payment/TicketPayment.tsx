import { useCreateTicket, useConfirmTicketAndPayment } from '@/hooks/clientCustomHooks'
import { useState, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import PaymentForm from './Payment'
import { TicketBackendEntity } from '@/types/TicketBackendEntity'
import { TicketConfirmationModal } from './TicketConfimationModal'
import { TicketEntity } from '@/types/TicketPaymentType'
import { toast } from 'react-toastify'

function TicketPaymentForm() {
    const [updatedTicket, setUpdatedTicket] = useState<TicketBackendEntity>()
    const [isOpen, setIsOpen] = useState<boolean>(false)
    // Changed from array to single ticket
    const [createdTicket, setCreatedTicket] = useState<TicketBackendEntity | null>(null) 
    const [confirmedTicket, setConfirmedTicket] = useState<TicketBackendEntity | null>(null) 
    
    // Keep ref for single ticket
    const createdTicketRef = useRef<TicketBackendEntity | null>(null)
    
    const location = useLocation()
    const data = location.state
    const createTicket = useCreateTicket()
    const confirmTicket = useConfirmTicketAndPayment()

    const handleCreatePaymentIntent = async (paymentMethodId: string) => {
        try {
            if (!data.ticketData.ticketVariants || typeof data.ticketData.ticketVariants !== 'object') {
                throw new Error('Invalid ticket variants data');
            }

            const response = await createTicket.mutateAsync({
                ticket: data.ticketData,
                paymentIntentId: paymentMethodId,
                totalAmount: data.amount,
                totalCount: data.totalTicketCount,
                vendorId: data.vendorId,
            });
            
            console.log('Create ticket response:', response);
            
            if (response.error || !response.stripeClientId) {
                if (response.message === "Ticket booking limit exceeded" && response.details) {
                    const limitDetails = response.details.map(detail => 
                        `• ${detail.variant.toUpperCase()}: You requested ${detail.requested} ticket${detail.requested > 1 ? 's' : ''}, but only ${detail.remainingLimit} remaining (limit: ${detail.maxPerUser} per user)`
                    ).join('\n');
                    
                    const formattedMessage = `Booking Limit Exceeded:\n\n${limitDetails}\n\nPlease adjust your ticket selection and try again.`;
                    throw new Error(formattedMessage);
                }
                
                throw new Error(response.message || 'Failed to create ticket - no client secret received');
            }
            
            console.log('✅ Consolidated ticket created successfully, got stripeClientId:', response.stripeClientId);
            
            // Handle single consolidated ticket
            let ticket = null;
            if (response.createdTicket) {
                ticket = response.createdTicket;
            } else {
                throw new Error('No ticket found in response');
            }
            
            setCreatedTicket(ticket);
            createdTicketRef.current = ticket;

            // Calculate total QR codes across all variants
            const totalQRCodes = ticket.ticketVariants?.reduce((sum, variant) => 
                sum + (variant.qrCodes?.length || 0), 0) || 0;

            console.log(`✅ Ticket created with ${ticket.ticketVariants?.length || 0} variants and ${totalQRCodes} total QR codes`);

            return {
                clientSecret: response.stripeClientId, 
                payload: ticket,
                tickets: [ticket], // Wrap single ticket in array for compatibility
            };
        } catch (error) {
            console.error('Error creating ticket:', error);
            let errorMessage = "Error creating ticket";
            
            if (error instanceof Error) {
                errorMessage = error.message;
            }
            
            throw error; 
        }
    };

    const handleConfirmSuccess = (ticketData: TicketEntity, paymentIntentId: string, paymentResult?: any) => {
        console.log('🔍 handleConfirmSuccess called with:', {
            ticketData,
            paymentIntentId,
            paymentResult,
            createdTicket,
            createdTicketRef: createdTicketRef.current
        });

        let ticketToConfirm = null;
        
        // Handle single ticket confirmation
        if (paymentResult && paymentResult.payload) {
            ticketToConfirm = paymentResult.payload;
        }
        else if (createdTicketRef.current) {
            ticketToConfirm = createdTicketRef.current;
        }
        else if (createdTicket) {
            ticketToConfirm = createdTicket;
        }
        else if (ticketData && ticketData.eventId) {
            ticketToConfirm = ticketData;
        }
        
        if (!ticketToConfirm) {
            toast.error('No ticket found to confirm. Please try again.');
            return;
        }

        // Validate ticket has required fields
        if (!ticketToConfirm.eventId || !ticketToConfirm.ticketId) {
            toast.error('Invalid ticket data. Please try again.');
            return;
        }

        // Calculate total QR codes for validation
        const totalQRCodes = ticketToConfirm.ticketVariants?.reduce((sum, variant) => 
            sum + (variant.qrCodes?.length || 0), 0) || ticketToConfirm.ticketCount || 1;

        if (totalQRCodes !== data.totalTicketCount) {
            console.warn(`QR codes count (${totalQRCodes}) doesn't match expected total (${data.totalTicketCount})`);
        }

        console.log('✅ Confirming consolidated ticket:', {
            ticketId: ticketToConfirm.ticketId,
            variants: ticketToConfirm.ticketVariants?.map(v => ({
                variant: v.variant,
                count: v.count,
                qrCodes: v.qrCodes?.length || 0
            })) || [],
            totalQRCodes,
            eventId: ticketToConfirm.eventId
        });

        confirmTicket.mutate({
            tickets: [ticketToConfirm], // Send as array for API compatibility
            allTickets: [ticketToConfirm],
            ticket: ticketToConfirm,
            paymentIntent: paymentIntentId,
            vendorId: data.vendorId,
            totalTickets: totalQRCodes, // Use total QR codes count
        }, {
            onSuccess: (responseData) => {
                console.log('🔍 Confirm ticket response:', responseData);
                
                // Extract the actual ticket data from the API response
                let finalConfirmedTicket = null;
                
                // Handle the actual API response structure based on your logs
                if (responseData.confirmedTicket) {
                    finalConfirmedTicket = responseData.confirmedTicket;
                } else if (responseData.confirmTicketAndPayment) {
                    finalConfirmedTicket = responseData.confirmTicketAndPayment;
                } else if (Array.isArray(responseData)) {
                    finalConfirmedTicket = responseData[0];
                } else {
                    finalConfirmedTicket = responseData;
                }

                if (!finalConfirmedTicket) {
                    toast.error('No confirmed ticket found. Please contact support.');
                    return;
                }

                console.log('🔍 Final confirmed ticket:', finalConfirmedTicket);

                // Set the states
                setUpdatedTicket(finalConfirmedTicket);
                setConfirmedTicket(finalConfirmedTicket);
                
                // Calculate total tickets from variants or use ticketCount
                const totalTickets = finalConfirmedTicket.ticketVariants?.reduce((sum, variant) => 
                    sum + variant.count, 0) || finalConfirmedTicket.ticketCount || 1;
                
                // Show success message
                if (totalTickets === 1) {
                    toast.success('Ticket confirmed successfully!');
                } else {
                    toast.success(`${totalTickets} tickets confirmed successfully!`);
                }

                // Open modal after a brief delay to ensure state is updated
                setTimeout(() => {
                    console.log('🔍 Opening modal with ticket:', finalConfirmedTicket);
                    setIsOpen(true);
                }, 100);
            },
            onError: (error) => {
                
                let errorMessage = "Failed to confirm ticket";
      
      if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    toast.error(errorMessage); 
            }
        });
    };

    const handleCloseModal = () => {
        console.log('🔍 Closing modal');
        setIsOpen(false);
    };

    // Calculate total tickets for modal
    const getTotalTicketsForModal = () => {
        if (confirmedTicket?.ticketVariants) {
            return confirmedTicket.ticketVariants.reduce((sum, variant) => sum + variant.count, 0);
        }
        return confirmedTicket?.ticketCount || createdTicket?.ticketCount || data.totalTicketCount || 1;
    };

    // Create confirmation data structure that matches modal expectations
    const createConfirmationData = () => {
        const ticket = updatedTicket || confirmedTicket;
        if (!ticket) {
            console.log('❌ No ticket data available for modal');
            return null;
        }

        console.log('🔍 Creating confirmation data from ticket:', ticket);

        // Calculate total QR codes
        const totalQRCodes = ticket.ticketVariants?.reduce((sum, variant) => 
            sum + (variant.qrCodes?.length || 0), 0) || ticket.ticketCount || 1;

        const confirmationData = {
            message: "Payment successful",
            confirmedTicket: {
                _id: ticket._id || ticket.ticketId,
                ticketId: ticket.ticketId,
                clientId: ticket.clientId || "",
                email: ticket.email || data.email || "",
                eventId: ticket.eventId,
                phone: ticket.phone,
                qrCodeLink: ticket.qrCodeLink,
                ticketVariants: ticket.ticketVariants || [],
                totalAmount: ticket.totalAmount || data.amount,
                ticketCount: ticket.ticketCount || data.totalTicketCount,
                paymentStatus: ticket.paymentStatus || "confirmed",
                ticketStatus: ticket.ticketStatus || "confirmed"
            },
            ticketDetails: {
                ticketId: ticket.ticketId,
                totalAmount: ticket.totalAmount || data.amount,
                totalTickets: getTotalTicketsForModal(),
                variants: ticket.ticketVariants?.map(variant => ({
                    type: variant.variant,
                    count: variant.count,
                    subtotal: variant.subtotal || (variant.count * (data.amount / data.totalTicketCount)),
                    qrCodes: variant.qrCodes?.length || 0
                })) || [{
                    type: "general",
                    count: ticket.ticketCount || data.totalTicketCount,
                    subtotal: ticket.totalAmount || data.amount,
                    qrCodes: ticket.ticketCount || data.totalTicketCount
                }],
                paymentStatus: ticket.paymentStatus || "confirmed",
                ticketStatus: ticket.ticketStatus || "confirmed"
            }
        };

        console.log('🔍 Created confirmation data:', confirmationData);
        return confirmationData;
    };

    const confirmationData = createConfirmationData();

    console.log('🔍 Render state:', { 
        isOpen, 
        hasUpdatedTicket: !!updatedTicket, 
        hasConfirmedTicket: !!confirmedTicket,
        hasConfirmationData: !!confirmationData
    });

    return (
        <div className='h-screen'>
            {isOpen && confirmationData && (
                <TicketConfirmationModal 
                    isOpen={isOpen} 
                    setIsOpen={handleCloseModal} 
                    confirmationData={confirmationData}
                />
            )}
            <PaymentForm 
                amount={data.amount} 
                onConfirmSuccess={handleConfirmSuccess} 
                onCreatePaymentIntent={handleCreatePaymentIntent} 
            />
        </div>
    )
}

export default TicketPaymentForm