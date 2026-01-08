import { SearchLocationOptions } from "../../../../dto/searchLocationOptionsDTO";
import { SearchEventsResult } from "../../../../dto/searchResultDTO";

export interface IsearchEventsOnLocationUseCase {
    searchEventsByLocation(locationQuery: string, options?: SearchLocationOptions): Promise<SearchEventsResult>;
}
