import { EventEntity } from "../../../domain/entities/event/eventEntity";
import { IeventRepository } from "../../../domain/interfaces/repositoryInterfaces/event/IeventRepository";
import { IsearchEventsVendorUseCase } from "../../../domain/interfaces/useCaseInterfaces/vendor/event/IsearchEventsVendorUseCase";

export class SearchEventsVendorUseCase implements IsearchEventsVendorUseCase {
    private eventsDatabase: IeventRepository;

    constructor(eventsDatabase: IeventRepository) {
        this.eventsDatabase = eventsDatabase;
    }

    async searchEvents(
        vendorId: string,
        searchQuery: string,
        pageNo: number
    ): Promise<{
        events: EventEntity[] | [];
        totalPages: number;
        totalResults: number;
    }> {
        if (!searchQuery || searchQuery.trim().length === 0) {
            throw new Error('Search query is required');
        }

        const { events, totalPages, totalResults } = 
            await this.eventsDatabase.searchEventsByName(
                vendorId,
                searchQuery,
                pageNo
            );


        return { events, totalPages, totalResults };
    }
}