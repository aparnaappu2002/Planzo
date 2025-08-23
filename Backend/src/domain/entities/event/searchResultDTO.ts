import { EventEntity } from "./eventEntity";

export interface SearchEventsResult {
    events: EventEntity[];
    totalPages: number;
    totalCount: number;
    searchQuery?: string;
}
