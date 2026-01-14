import { EventEntity } from "../../../../entities/event/eventEntity";

export interface IsearchEventsVendorUseCase {
    searchEvents(
        vendorId: string,
        searchQuery: string,
        pageNo: number
    ): Promise<{
        events: EventEntity[] | [];
        totalPages: number;
        totalResults: number;
    }>;
}