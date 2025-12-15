import { IsearchEventsOnLocationUseCase } from "../../../domain/interfaces/useCaseInterfaces/client/events/IsearchEventsOnLocationUseCase";
import { IeventRepository } from "../../../domain/interfaces/repositoryInterfaces/event/IeventRepository";
import { SearchLocationOptions } from "../../../domain/dto/searchLocationOptionsDTO";
import { SearchEventsResult } from "../../../domain/dto/searchResultDTO";


export class SearchEventsOnLocationUseCase implements IsearchEventsOnLocationUseCase {
    private eventDatabase: IeventRepository;
    
    constructor(eventDatabase: IeventRepository) {
        this.eventDatabase = eventDatabase;
    }
    
    async searchEventsByLocation(
        locationQuery: string, 
        options: SearchLocationOptions = {}
    ): Promise<SearchEventsResult> {
        if (!locationQuery || locationQuery.trim() === '') {
            throw new Error('Location query is required');
        }

        const { pageNo = 1, limit = 10, range = 25 } = options;

        try {
            const result = await this.eventDatabase.findEventsNearLocation(
                locationQuery.trim(), 
                { pageNo, limit, range }
            );

            return {
                ...result,
                searchQuery: locationQuery
            };
        } catch (error) {
            console.error('Error searching events by location:', error);
            throw new Error('Failed to search events by location');
        }
    }
}
