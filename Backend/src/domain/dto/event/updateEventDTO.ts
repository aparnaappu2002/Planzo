
export interface UpdateEventDTO {
    title?: string;
    description?: string;
    location?: {
        longitude: number;
        latitude: number;
    };
    startTime?: Date;
    endTime?: Date;
    posterImage?: string[];
    pricePerTicket?: number;
    maxTicketsPerUser?: number;
    totalTicket?: number;
    date?: Date[];
    createdAt?: Date;
    attendees?: string[];
    ticketPurchased?: number;
    address?: string;
    venueName?: string;
    category?: string;
    status?: "upcoming" | "completed" | "cancelled";
}