import { SearchLocationOptions } from "../../../../entities/event/searchLocationOptionsDTO";
import { SearchEventsResult } from "../../../../entities/event/searchResultDTO";

export interface IsearchEventsOnLocationUseCase {
    searchEventsByLocation(locationQuery: string, options?: SearchLocationOptions): Promise<SearchEventsResult>;
}
