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
exports.EventController = void 0;
const httpStatus_1 = require("../../../../domain/enums/httpStatus");
class EventController {
    constructor(eventCreateUseCase, findAllEventsVendorUseCase, updateEventUseCase) {
        this.eventCreateUseCase = eventCreateUseCase;
        this.findAllEventsVendorUseCase = findAllEventsVendorUseCase;
        this.updateEventUseCase = updateEventUseCase;
    }
    handleCreateEvent(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { vendorId } = req.params;
                const { event } = req.body;
                const createdEvent = yield this.eventCreateUseCase.createEvent(event, vendorId);
                res.status(httpStatus_1.HttpStatus.CREATED).json({ message: "Event created", createdEvent });
            }
            catch (error) {
                console.log('error while creating event', error);
                res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({
                    message: 'error while creating event',
                    error: error instanceof Error ? error.message : 'error while creating event'
                });
            }
        });
    }
    handleFindAllEventsVendor(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const vendorId = req.params.vendorId;
                const pageNo = parseInt(req.params.pageNo, 10) || 1;
                const { events, totalPages } = yield this.findAllEventsVendorUseCase.findAllEvents(vendorId, pageNo);
                res.status(httpStatus_1.HttpStatus.OK).json({ message: "Events fetched", events, totalPages });
            }
            catch (error) {
                console.log('error while finding all events in vendor side', error);
                res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({
                    message: 'error while finding all events in vendor side',
                    error: error instanceof Error ? error.message : 'error while finding all events in vendor side'
                });
            }
        });
    }
    handleUpdateEvent(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { eventId, update } = req.body;
                const updatedEvent = yield this.updateEventUseCase.updateEvent(eventId, update);
                res.status(httpStatus_1.HttpStatus.OK).json({ message: "Event Updated", updatedEvent });
            }
            catch (error) {
                console.log('Error while updating event', error);
                res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({
                    message: "error while updating event",
                    error: error instanceof Error ? error.message : 'Error while updating event'
                });
            }
        });
    }
}
exports.EventController = EventController;
