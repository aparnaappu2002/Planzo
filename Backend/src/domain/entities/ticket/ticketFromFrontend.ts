export interface TicketFromFrontend {
    clientId: string;
    email: string;
    phone: string;
    eventId: string;
    ticketVariants: Record<string, number>; // variant type -> quantity
}