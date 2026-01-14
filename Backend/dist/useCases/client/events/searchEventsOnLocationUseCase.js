"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchEventsOnLocationUseCase = void 0;
class SearchEventsOnLocationUseCase {
    constructor(eventDatabase) {
        this.eventDatabase = eventDatabase;
    }
    searchEventsByLocation(locationQuery_1) {
        return __awaiter(this, arguments, void 0, function* (locationQuery, options = {}) {
            if (!locationQuery || locationQuery.trim() === '') {
                throw new Error('Location query is required');
            }
            const { pageNo = 1, limit = 10, range = 25 } = options;
            try {
                const result = yield this.eventDatabase.findEventsNearLocation(locationQuery.trim(), { pageNo, limit, range });
                return Object.assign(Object.assign({}, result), { searchQuery: locationQuery });
            }
            catch (error) {
                console.error('Error searching events by location:', error);
                throw new Error('Failed to search events by location');
            }
        });
    }
}
exports.SearchEventsOnLocationUseCase = SearchEventsOnLocationUseCase;
