export interface TicketVariant {
    type: 'standard' | 'premium' | 'vip';
    price: number;
    totalTickets: number;
    ticketsSold: number;
    maxPerUser: number;
    description?: string;
    benefits?: string[];
}

export interface EventEntity {
    _id?: string;
    title: string;
    description: string;
    location: {
        type: string,
        coordinates: [number, number];
    },
    hostedBy:  string,
    startTime: Date;
    endTime: Date;
    posterImage: string[];
    ticketVariants: TicketVariant[];
    date: Date[];
    createdAt: Date;
    attendees: string
    address?: string
    venueName?: string
    category: string
    status: "upcoming" | "completed" | "cancelled"
    attendeesCount: number
    isActive: boolean
}