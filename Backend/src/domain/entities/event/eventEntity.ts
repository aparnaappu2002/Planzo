import { ObjectId } from "mongoose";

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
    _id?: ObjectId;
    title: string;
    description: string;
    location: {
        type: string,
        coordinates: [number, number];
    },
    hostedBy: ObjectId | string,
    startTime: Date;
    endTime: Date;
    posterImage: string[];
    ticketVariants: TicketVariant[];
    date: Date[];
    createdAt: Date;
    attendees: ObjectId[]
    address?: string
    venueName?: string
    category: string
    status: "upcoming" | "completed" | "cancelled"
    attendeesCount: number
    isActive: boolean
}