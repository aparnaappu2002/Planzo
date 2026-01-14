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
exports.EventsClientController = void 0;
const httpStatus_1 = require("../../../../domain/enums/httpStatus");
const messages_1 = require("../../../../domain/enums/messages");
class EventsClientController {
    constructor(findAllEventClientUseCase, findEventByIdUseCase, searchEventsUseCase, findEventsNearToClient, findEventsBasedOnCategory, searchEventsOnLocationUseCase) {
        this.findAllEventClientUseCase = findAllEventClientUseCase;
        this.findEventByIdUseCase = findEventByIdUseCase;
        this.searchEventsUseCase = searchEventsUseCase;
        this.findEventsNearToClient = findEventsNearToClient;
        this.findEventsBasedOnCategory = findEventsBasedOnCategory;
        this.searchEventsOnLocationUseCase = searchEventsOnLocationUseCase;
    }
    handleFindAllEventsClient(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const pageNo = parseInt(req.params.pageNo, 10) || 1;
                const { events, totalPages } = yield this.findAllEventClientUseCase.findAllEvents(pageNo);
                res.status(httpStatus_1.HttpStatus.OK).json({ message: messages_1.Messages.EVENT_FETCHED, events, totalPages });
            }
            catch (error) {
                console.log('error while finding all events', error);
                res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({
                    message: messages_1.Messages.EVENT_FETCH_ERROR,
                    error: error instanceof Error ? error.message : messages_1.Messages.EVENT_FETCH_ERROR
                });
            }
        });
    }
    handleFindEventById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { eventId } = req.params;
                console.log(eventId);
                const event = yield this.findEventByIdUseCase.findEventById(eventId);
                res.status(httpStatus_1.HttpStatus.OK).json({
                    message: messages_1.Messages.EVENT_FOUND,
                    event
                });
            }
            catch (error) {
                console.log("error while finding event by id", error);
                res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({
                    message: messages_1.Messages.EVENT_NOT_FOUND,
                    error: error instanceof Error ? error.message : messages_1.Messages.EVENT_NOT_FOUND
                });
            }
        });
    }
    handleSearchEvents(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const query = req.query.query;
                if (typeof query !== 'string') {
                    res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({ message: messages_1.Messages.INVALID_INPUT });
                    return;
                }
                const searchEvents = yield this.searchEventsUseCase.searchEvents(query);
                console.log("SearchEvents", searchEvents);
                res.status(httpStatus_1.HttpStatus.OK).json({ message: messages_1.Messages.EVENT_FOUND, searchEvents });
            }
            catch (error) {
                console.log('error while performing search in events', error);
                res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({
                    message: messages_1.Messages.EVENT_NOT_FOUND,
                    error: error instanceof Error ? error.message : messages_1.Messages.EVENT_NOT_FOUND
                });
            }
        });
    }
    handleEventsNearToUse(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { latitude, longitude, pageNo, range } = req.params;
                const kmRange = parseInt(range, 10) || 30000;
                const page = parseInt(pageNo, 10) || 1;
                const lat = parseFloat(latitude);
                const log = parseFloat(longitude);
                const { events, totalPages } = yield this.findEventsNearToClient.findEventsNearToClient(lat, log, page, kmRange);
                res.status(httpStatus_1.HttpStatus.OK).json({ message: messages_1.Messages.EVENT_FETCH_NEAR, events, totalPages });
            }
            catch (error) {
                console.log('error while finding the events near to you', error);
                res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({
                    message: messages_1.Messages.EVENT_FETCH_NEAR_ERROR,
                    error: error instanceof Error ? error.message : messages_1.Messages.EVENT_FETCH_NEAR_ERROR
                });
            }
        });
    }
    handleFindEventsBasedOnCategory(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { category, pageNo, sortBy } = req.params;
                console.log(category, pageNo, sortBy);
                const page = parseInt(pageNo, 10) || 1;
                const { events, totalPages } = yield this.findEventsBasedOnCategory.findEventsbasedOnCategory(category, page, sortBy);
                console.log(events);
                res.status(httpStatus_1.HttpStatus.OK).json({ message: messages_1.Messages.EVENT_FETCHED, events, totalPages });
            }
            catch (error) {
                console.log('error while finding events based on category', error);
                res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({
                    message: messages_1.Messages.EVENT_FETCH_ERROR,
                    error: error instanceof Error ? error.message : messages_1.Messages.EVENT_FETCH_ERROR
                });
            }
        });
    }
    handleEventsNearLocation(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { locationQuery, pageNo, limit, range } = req.body;
                // Validate required fields
                if (!locationQuery || locationQuery.trim() === '') {
                    res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({
                        message: messages_1.Messages.LOCATION_QUERY_REQUIRED,
                        error: 'Please provide a valid location query'
                    });
                    return;
                }
                // Parse and validate optional parameters
                const page = parseInt(pageNo, 10) || 1;
                const itemsPerPage = parseInt(limit, 10) || 10;
                const searchRange = parseInt(range, 10) || 25;
                // Validate parameters
                if (page < 1) {
                    res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({
                        message: 'Invalid page number',
                        error: 'Page number must be greater than 0'
                    });
                    return;
                }
                if (itemsPerPage < 1 || itemsPerPage > 100) {
                    res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({
                        message: 'Invalid limit',
                        error: 'Limit must be between 1 and 100'
                    });
                    return;
                }
                // Call use case
                const result = yield this.searchEventsOnLocationUseCase.searchEventsByLocation(locationQuery.trim(), {
                    pageNo: page,
                    limit: itemsPerPage,
                    range: searchRange
                });
                res.status(httpStatus_1.HttpStatus.OK).json({
                    message: `Events found near ${locationQuery}`,
                    success: true,
                    data: result,
                    pagination: {
                        currentPage: page,
                        totalPages: result.totalPages,
                        totalEvents: result.totalCount,
                        eventsPerPage: itemsPerPage,
                        hasNextPage: page < result.totalPages,
                        hasPreviousPage: page > 1
                    }
                });
            }
            catch (error) {
                console.error('Error while finding events near location:', error);
                res.status(httpStatus_1.HttpStatus.INTERNAL_SERVER_ERROR).json({
                    message: messages_1.Messages.EVENTS_NEAR_LOCATION_ERROR,
                    success: false,
                    error: error instanceof Error ? error.message : messages_1.Messages.EVENTS_NEAR_LOCATION_ERROR
                });
            }
        });
    }
}
exports.EventsClientController = EventsClientController;
