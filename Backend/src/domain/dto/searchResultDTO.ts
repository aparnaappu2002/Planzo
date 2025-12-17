import { EventEntity } from "../entities/event/eventEntity";

export interface SearchEventsResult {
    events: EventEntity[];
    totalPages: number;
    totalCount: number;
    searchQuery?: string;
}
