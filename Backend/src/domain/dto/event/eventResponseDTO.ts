export interface EventResponseDTO {
    id: string;
    title: string;
    description: string;
    location: {
        type: string;
        coordinates: [number, number];
    };
    hostedBy: string;
    startTime: Date;
    endTime: Date;
    posterImage: string[];
    ticketVariants: {
        type: string;
        price: number;
        totalTickets: number;
        ticketsSold: number;
        maxPerUser: number;
        description?: string;
        benefits?: string[];
    }[];
    date: Date[];
    address?: string;
    venueName?: string;
    category: string;
    status: "upcoming" | "completed" | "cancelled";
    attendeesCount: number;
    isActive: boolean;
}
