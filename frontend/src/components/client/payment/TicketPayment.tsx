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
    const [createdTicket, setCreatedTicket] = useState<TicketBackendEntity | null>(null) 
    const [confirmedTicket, setConfirmedTicket] = useState<TicketBackendEntity | null>(null) 
    
    const createdTicketRef = useRef<TicketBackendEntity | null>(null)
    
    const location = useLocation()
    const data = location.state
    const createTicket = useCreateTicket()
    const confirmTicket = useConfirmTicketAndPayment()

    const handleCreatePaymentIntent = async () => {
        try {
            console.log('🚀 Starting ticket creation...');
            
            if (!data.ticketData.ticketVariants || typeof data.ticketData.ticketVariants !== 'object') {
                throw new Error('Invalid ticket variants data');
            }

            const axiosResponse = await createTicket.mutateAsync({
                ticket: data.ticketData,
                totalAmount: data.amount,
                totalCount: data.totalTicketCount,
                vendorId: data.vendorId,
            });
            
            console.log('📦 Full Axios response:', axiosResponse);
            
            // ✅ Handle both Axios wrapped response and direct response
            const response = axiosResponse.data || axiosResponse;
            
            console.log('📦 Extracted response data:', response);
            console.log('🔍 Response keys:', Object.keys(response));
            
            // Check for errors in response
            if (response.error) {
                if (response.message === "Ticket booking limit exceeded" && response.details) {
                    const limitDetails = response.details.map(detail => 
                        `• ${detail.variant.toUpperCase()}: You requested ${detail.requested} ticket${detail.requested > 1 ? 's' : ''}, but only ${detail.remainingLimit} remaining (limit: ${detail.maxPerUser} per user)`
                    ).join('\n');
                    
                    const formattedMessage = `Booking Limit Exceeded:\n\n${limitDetails}\n\nPlease adjust your ticket selection and try again.`;
                    throw new Error(formattedMessage);
                }
                
                throw new Error(response.message || 'Failed to create ticket');
            }

            // ✅ Extract data from response
            const clientSecret = response.clientSecret;
            const paymentIntentId = response.paymentIntentId;
            const ticket = response.createdTicket;
            const summary = response.summary;
            
            console.log('🔑 Client Secret:', clientSecret);
            console.log('💳 Payment Intent ID:', paymentIntentId);
            console.log('🎫 Created Ticket:', ticket);
            console.log('📊 Summary:', summary);

            // Validate we have required data
            if (!clientSecret) {
                console.error('❌ No client secret found in response');
                throw new Error('No client secret received from server. Payment cannot be processed.');
            }

            if (!paymentIntentId) {
                console.error('❌ No payment intent ID found in response');
                throw new Error('No payment intent ID received from server.');
            }

            if (!ticket) {
                console.error('❌ No ticket data in response');
                throw new Error('No ticket data received from server');
            }
            
            console.log('✅ Ticket created successfully');
            
            // Validate ticket structure
            if (!ticket.ticketId || !ticket.eventId) {
                console.error('❌ Invalid ticket structure:', ticket);
                throw new Error('Invalid ticket data received - missing required fields');
            }

            if (!ticket.ticketVariants || !Array.isArray(ticket.ticketVariants) || ticket.ticketVariants.length === 0) {
                console.error('❌ Invalid ticket variants:', ticket.ticketVariants);
                throw new Error('Invalid ticket data received - no variants found');
            }
            
            // Store ticket in state and ref
            setCreatedTicket(ticket);
            createdTicketRef.current = ticket;

            // Log ticket details from summary
            if (summary) {
                console.log(`✅ Created ticket with:
- Ticket ID: ${summary.ticketId}
- Variants: ${summary.totalVariants}
- Total Tickets: ${summary.totalTickets}
- Total QR Codes: ${summary.totalQRCodes}
- Total Amount: ₹${summary.totalAmount}
- Payment Status: ${summary.paymentStatus}
- Ticket Status: ${summary.ticketStatus}`);
                
                console.log('📋 Variants breakdown:');
                summary.variants?.forEach((v: any) => {
                    console.log(`  - ${v.type}: ${v.quantity} ticket(s) @ ₹${v.pricePerTicket} = ₹${v.subtotal} (${v.qrCodesCount} QR codes)`);
                });
            }

            // ✅ Return all required data for PaymentForm
            return {
                clientSecret: clientSecret,  // For Stripe to confirm payment
                paymentIntentId: paymentIntentId,  // The actual pi_... ID
                payload: ticket,
                tickets: [ticket],
                summary: summary
            };
        } catch (error) {
            console.error('❌ Error creating ticket:', error);
            
            if (error instanceof Error) {
                toast.error(error.message);
            } else {
                toast.error("Error creating ticket");
            }
            
            throw error; 
        }
    };

    const handleConfirmSuccess = (ticketData: TicketEntity, paymentIntentId: string, paymentResult?: any) => {
        console.log('🎉 Payment confirmed, preparing ticket confirmation...');
        console.log('💳 Payment Intent ID:', paymentIntentId);
        console.log('📦 Payment Result:', paymentResult);

        let ticketToConfirm = null;
        
        // Priority order for getting ticket data
        if (paymentResult && paymentResult.payload) {
            console.log('✅ Using ticket from payment result');
            ticketToConfirm = paymentResult.payload;
        }
        else if (createdTicketRef.current) {
            console.log('✅ Using ticket from ref');
            ticketToConfirm = createdTicketRef.current;
        }
        else if (createdTicket) {
            console.log('✅ Using ticket from state');
            ticketToConfirm = createdTicket;
        }
        else if (ticketData && ticketData.eventId) {
            console.log('⚠️ Using ticket from ticketData (fallback)');
            ticketToConfirm = ticketData;
        }
        
        if (!ticketToConfirm) {
            console.error('❌ No ticket found to confirm');
            toast.error('No ticket found to confirm. Please try again.');
            return;
        }

        console.log('📋 Ticket to confirm:', ticketToConfirm);

        // Validate ticket has required fields
        if (!ticketToConfirm.eventId || !ticketToConfirm.ticketId) {
            console.error('❌ Invalid ticket data - missing required fields:', {
                hasEventId: !!ticketToConfirm.eventId,
                hasTicketId: !!ticketToConfirm.ticketId
            });
            toast.error('Invalid ticket data. Missing required fields.');
            return;
        }

        // Validate ticketVariants
        if (!ticketToConfirm.ticketVariants || !Array.isArray(ticketToConfirm.ticketVariants) || ticketToConfirm.ticketVariants.length === 0) {
            console.error('❌ Invalid ticket variants:', ticketToConfirm.ticketVariants);
            toast.error('Invalid ticket data. No ticket variants found.');
            return;
        }

        // Calculate total QR codes for logging
        const totalQRCodes = ticketToConfirm.ticketVariants.reduce((sum, variant) => 
            sum + (variant.qrCodes?.length || 0), 0);

        console.log('✅ Confirming ticket:', {
            ticketId: ticketToConfirm.ticketId,
            eventId: ticketToConfirm.eventId,
            paymentIntentId: paymentIntentId,
            totalAmount: ticketToConfirm.totalAmount,
            ticketCount: ticketToConfirm.ticketCount,
            variantCount: ticketToConfirm.ticketVariants.length,
            totalQRCodes,
            variants: ticketToConfirm.ticketVariants.map(v => ({
                variant: v.variant,
                count: v.count,
                pricePerTicket: v.pricePerTicket,
                subtotal: v.subtotal,
                qrCodes: v.qrCodes?.length || 0
            }))
        });

        // ✅ Send confirmation to backend with payment intent ID
        confirmTicket.mutate({
            ticket: ticketToConfirm,
            paymentIntent: paymentIntentId,  // ✅ This is the pi_... ID from Stripe
            vendorId: data.vendorId,
        }, {
            onSuccess: (responseData) => {
                console.log('🎉 Confirm ticket response:', responseData);
                
                // Handle potential Axios wrapper
                const response = responseData.data || responseData;
                
                // Extract confirmed ticket from response
                let finalConfirmedTicket = null;
                
                if (response.confirmedTicket) {
                    finalConfirmedTicket = response.confirmedTicket;
                } else if (Array.isArray(response)) {
                    finalConfirmedTicket = response[0];
                } else {
                    finalConfirmedTicket = response;
                }

                if (!finalConfirmedTicket) {
                    console.error('❌ No confirmed ticket found in response:', response);
                    toast.error('No confirmed ticket found in response. Please contact support.');
                    return;
                }

                console.log('✅ Final confirmed ticket:', finalConfirmedTicket);
                if (response.ticketDetails) {
                    console.log('📋 Ticket details:', response.ticketDetails);
                }

                // Update states
                setUpdatedTicket(finalConfirmedTicket);
                setConfirmedTicket(finalConfirmedTicket);
                
                // Get total tickets from ticketDetails or calculate from variants
                const totalTickets = response.ticketDetails?.totalTickets || 
                    finalConfirmedTicket.ticketVariants?.reduce((sum, variant) => sum + variant.count, 0) || 
                    finalConfirmedTicket.ticketCount || 1;
                
                console.log(`✅ Successfully confirmed ${totalTickets} ticket(s)`);
                
                // Show success message
                if (totalTickets === 1) {
                    toast.success('Ticket confirmed successfully!');
                } else {
                    toast.success(`${totalTickets} tickets confirmed successfully!`);
                }

                // Open modal after brief delay
                setTimeout(() => {
                    console.log('🎫 Opening confirmation modal');
                    setIsOpen(true);
                }, 100);
            },
            onError: (error) => {
                console.error('❌ Error confirming ticket:', error);
                
                let errorMessage = "Failed to confirm ticket";
                
                if (error instanceof Error) {
                    errorMessage = error.message;
                }
                
                toast.error(errorMessage); 
            }
        });
    };

    const handleCloseModal = () => {
        console.log('🔒 Closing modal');
        setIsOpen(false);
    };

    // Calculate total tickets for modal
    const getTotalTicketsForModal = () => {
        if (confirmedTicket?.ticketVariants) {
            return confirmedTicket.ticketVariants.reduce((sum, variant) => sum + variant.count, 0);
        }
        return confirmedTicket?.ticketCount || createdTicket?.ticketCount || data.totalTicketCount || 1;
    };

    // Create confirmation data structure for modal
    const createConfirmationData = () => {
        const ticket = updatedTicket || confirmedTicket;
        if (!ticket) {
            console.log('❌ No ticket data available for modal');
            return null;
        }

        console.log('📋 Creating confirmation data from ticket:', ticket);

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

        console.log('✅ Created confirmation data:', confirmationData);
        return confirmationData;
    };

    const confirmationData = createConfirmationData();

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