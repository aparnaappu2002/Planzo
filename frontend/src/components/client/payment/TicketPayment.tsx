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
    const [createdTickets, setCreatedTickets] = useState<TicketBackendEntity[]>([]) // Store created tickets
    const [confirmedTickets, setConfirmedTickets] = useState<TicketBackendEntity[]>([]) // Store confirmed tickets
    
    // Use ref to store tickets immediately after creation to avoid React state timing issues
    const createdTicketsRef = useRef<TicketBackendEntity[]>([])
    
    const location = useLocation()
    const data = location.state
    const createTicket = useCreateTicket()
    const confirmTicket = useConfirmTicketAndPayment()

    // In TicketPaymentForm.tsx - Update the handleCreatePaymentIntent function

const handleCreatePaymentIntent = async (paymentMethodId: string) => {
    try {
        console.log('Creating payment intent with data:', data);
        
        // Validate that we have ticketVariants data in correct format
        if (!data.ticketData.ticketVariants || typeof data.ticketData.ticketVariants !== 'object') {
            throw new Error('Invalid ticket variants data');
        }

        // Log the structure we're sending to backend
        console.log('Sending to backend:', {
            ticket: data.ticketData,
            paymentIntentId: paymentMethodId,
            totalAmount: data.amount,
            totalCount: data.totalTicketCount,
            vendorId: data.vendorId,
        });

        const response = await createTicket.mutateAsync({
            ticket: data.ticketData,
            paymentIntentId: paymentMethodId,
            totalAmount: data.amount,
            totalCount: data.totalTicketCount,
            vendorId: data.vendorId,
        });
        
        console.log('Create ticket response:', response);
        
        // CRITICAL FIX: Check for stripeClientId instead of clientSecret
        if (response.error || !response.stripeClientId) {
            // Handle specific limit exceeded error with enhanced formatting
            if (response.message === "Ticket booking limit exceeded" && response.details) {
                // Format the limit exceeded message for better readability
                const limitDetails = response.details.map(detail => 
                    `• ${detail.variant.toUpperCase()}: You requested ${detail.requested} ticket${detail.requested > 1 ? 's' : ''}, but only ${detail.remainingLimit} remaining (limit: ${detail.maxPerUser} per user)`
                ).join('\n');
                
                const formattedMessage = `Booking Limit Exceeded:\n\n${limitDetails}\n\nPlease adjust your ticket selection and try again.`;
                throw new Error(formattedMessage);
            }
            
            throw new Error(response.message || 'Failed to create ticket - no client secret received');
        }
        
        console.log('✅ Tickets created successfully, got stripeClientId:', response.stripeClientId);
        
        // Store the created tickets for later use
        let tickets = [];
        if (response.createdTickets && Array.isArray(response.createdTickets)) {
            tickets = response.createdTickets;
        } else if (response.createdTicket) {
            // If single ticket response (fallback)
            tickets = [response.createdTicket];
        } else {
            throw new Error('No tickets found in response');
        }
        
        // Store in both state and ref for immediate access
        setCreatedTickets(tickets);
        createdTicketsRef.current = tickets;
        console.log('Setting createdTickets to:', tickets);

        return {
            clientSecret: response.stripeClientId, // Map stripeClientId to clientSecret
            payload: tickets.length > 0 ? tickets[0] : null,
            tickets: tickets, // Return all tickets
        };
    } catch (error) {
        console.error('Error creating ticket:', error);
        let errorMessage = "Error creating ticket";
        
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        
        throw error; // Re-throw to prevent payment form from proceeding
    }
};

    const handleConfirmSuccess = (ticketData: TicketEntity, paymentIntentId: string, paymentResult?: any) => {
        
        
        // CRITICAL FIX: Use multiple sources with proper priority
        let ticketsToConfirm = [];
        
        // Priority 1: Use tickets from paymentResult (passed from PaymentForm)
        if (paymentResult && paymentResult.tickets && Array.isArray(paymentResult.tickets)) {
            ticketsToConfirm = paymentResult.tickets;
            console.log('✓ Using tickets from paymentResult:', ticketsToConfirm.length, 'tickets');
        }
        // Priority 2: Use tickets from ref (immediate access, no state timing issues)
        else if (createdTicketsRef.current.length > 0) {
            ticketsToConfirm = createdTicketsRef.current;
            console.log('✓ Using tickets from createdTicketsRef:', ticketsToConfirm.length, 'tickets');
        }
        // Priority 3: Use tickets from state
        else if (createdTickets.length > 0) {
            ticketsToConfirm = createdTickets;
            console.log('✓ Using tickets from createdTickets state:', ticketsToConfirm.length, 'tickets');
        }
        // Priority 4: Check if paymentResult has payload
        else if (paymentResult && paymentResult.payload) {
            console.log('Found payload in paymentResult, attempting to use it');
            ticketsToConfirm = [paymentResult.payload];
            console.log('✓ Using payload from paymentResult:', ticketsToConfirm.length, 'tickets');
        }
        // Priority 5: Fallback to single ticket data
        else if (ticketData && ticketData.eventId) {
            console.warn('⚠️ Only single ticket data available. This may cause incomplete confirmation for multiple tickets.');
            ticketsToConfirm = [ticketData];
            console.log('Using ticketData as fallback:', ticketsToConfirm.length, 'tickets');
        }
        
        // Final validation
        if (ticketsToConfirm.length === 0) {
            console.error('❌ No tickets found to confirm');
            toast.error('No tickets found to confirm. Please try again.');
            return;
        }

        // Check if we have the expected number of tickets
        if (ticketsToConfirm.length !== data.totalTicketCount) {
            console.error(`❌ CRITICAL: Ticket count mismatch! Expected: ${data.totalTicketCount}, Found: ${ticketsToConfirm.length}`);
            console.error('This means not all tickets will be confirmed!');
            console.error('Tickets found:', ticketsToConfirm.map(t => ({ id: t.ticketId, variant: t.ticketVariant })));
            
            // Show warning but continue - this is a serious issue
            toast.error(`Critical Error: Expected ${data.totalTicketCount} tickets but only found ${ticketsToConfirm.length}. Some tickets may not be confirmed.`);
        }

        // Validate that all tickets have required fields
        const invalidTickets = ticketsToConfirm.filter(ticket => !ticket || !ticket.eventId || !ticket.ticketId);
        if (invalidTickets.length > 0) {
            console.error('❌ Tickets missing required fields:', invalidTickets);
            toast.error('Invalid ticket data. Please try again.');
            return;
        }

        console.log(`✅ Confirming ${ticketsToConfirm.length} tickets:`, ticketsToConfirm.map(t => ({
            ticketId: t.ticketId,
            variant: t.ticketVariant,
            eventId: t.eventId
        })));

        // Send tickets to backend - use the format expected by the updated controller
        confirmTicket.mutate({
            tickets: ticketsToConfirm,        // Primary field - array of tickets
            allTickets: ticketsToConfirm,     // Backup field for controller compatibility
            ticket: ticketsToConfirm[0],      // Fallback single ticket for old controller compatibility
            paymentIntent: paymentIntentId,
            vendorId: data.vendorId,
            totalTickets: ticketsToConfirm.length,
        }, {
            onSuccess: (responseData) => {
                console.log('✅ Ticket confirmation successful:', responseData);
                
                // Handle the response based on the updated controller format
                let confirmedTickets = [];
                
                // Updated controller returns confirmedTickets array
                if (responseData.confirmedTickets && Array.isArray(responseData.confirmedTickets)) {
                    confirmedTickets = responseData.confirmedTickets;
                    console.log(`✅ Found ${confirmedTickets.length} confirmed tickets in response`);
                }
                // Fallback for single ticket format (confirmTicketAndPayment)
                else if (responseData.confirmTicketAndPayment) {
                    confirmedTickets = [responseData.confirmTicketAndPayment];
                    console.log('✅ Using single ticket from confirmTicketAndPayment field');
                }
                // Direct array response
                else if (Array.isArray(responseData)) {
                    confirmedTickets = responseData;
                    console.log('✅ Response is direct array of tickets');
                }
                // Single ticket response
                else {
                    confirmedTickets = [responseData];
                    console.log('✅ Using single ticket response');
                }

                if (confirmedTickets.length === 0) {
                    console.error('❌ No confirmed tickets found in response');
                    toast.error('No confirmed tickets found. Please contact support.');
                    return;
                }

                // Verify all tickets were confirmed
                if (confirmedTickets.length !== data.totalTicketCount) {
                    console.warn(`⚠️ Not all tickets confirmed! Expected: ${data.totalTicketCount}, Confirmed: ${confirmedTickets.length}`);
                }

                // Store all confirmed tickets and use the first ticket for the modal display
                const primaryTicket = confirmedTickets[0];
                setUpdatedTicket(primaryTicket);
                setConfirmedTickets(confirmedTickets); // Store all confirmed tickets
                setIsOpen(true);
                
                // Show appropriate success message
                const ticketCount = confirmedTickets.length;
                if (ticketCount === 1) {
                    toast.success('Ticket confirmed successfully!');
                } else {
                    toast.success(`${ticketCount} tickets confirmed successfully!`);
                }

                console.log(`✅ Confirmation completed for ${ticketCount} tickets`);
            },
            onError: (err) => {
                console.error('❌ Ticket confirmation error:', err);
                const errorMessage = err?.response?.data?.message || err?.message || 'Failed to confirm tickets';
                toast.error(errorMessage);
            }
        });
    };

    const handleCloseModal = () => {
        setIsOpen(false);
        // Optional: Navigate to a success page or tickets page
        // navigate('/my-tickets');
    };

    return (
        <div className='h-screen'>
            {isOpen && updatedTicket && (
                <TicketConfirmationModal 
                    isOpen={isOpen} 
                    setIsOpen={handleCloseModal} 
                    ticket={updatedTicket} 
                    totalTickets={confirmedTickets.length || data.totalTicketCount || createdTicketsRef.current.length || createdTickets.length}
                    allTickets={confirmedTickets.length > 0 ? confirmedTickets : createdTicketsRef.current}
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