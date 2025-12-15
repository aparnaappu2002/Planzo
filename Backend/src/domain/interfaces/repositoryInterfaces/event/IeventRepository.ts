import { ObjectId } from "mongoose";
import { EventEntity } from "../../../entities/event/eventEntity";
import { EventUpdateEntity } from "../../../entities/event/eventUpdateEntity";
import { SearchLocationOptions } from "../../../dto/searchLocationOptionsDTO";
import { SearchEventsResult } from "../../../entities/event/searchResultDTO";
import { EventDashboardDTO } from "../../../dto/eventDashboardDTO";

export interface IeventRepository{
    createEvent(event: EventEntity): Promise<EventEntity>
    findEventsOfAVendor(vendorId: string, pageNo: number): Promise<{ events: EventEntity[] | [], totalPages: number }>
    editEvent(eventId: string, update: EventUpdateEntity): Promise<EventEntity | null>
    findAllEventsClient(pageNo: number): Promise<{ events: EventEntity[] | [], totalPages: number }>
    findEventById(eventId: string): Promise<EventEntity | null>
    findTotalTicketAndBookedTicket(eventId: string): Promise<EventEntity | null>
    findTotalTicketCountAndticketPurchased(eventId: string | ObjectId): Promise<{ totalTicket: number, ticketPurchased: number }>
    updateTicketPurchaseCount(eventId: string | ObjectId, newCount: number): Promise<EventEntity | null>
    findEventsBasedOnQuery(query: string): Promise<EventEntity[] | []>
    findEventsNearToClient(latitude: number, longitude: number, totalPages: number, range: number): Promise<{ events: EventEntity[] | [], totalPages: number }>
    findEventsBaseOnCategory(category: string, pageNo: number, sortBy: string): Promise<{ events: EventEntity[] | [], totalPages: number }>
    findEventsNearLocation(locationQuery: string, options?: SearchLocationOptions): Promise<SearchEventsResult>;
    updateVariantTicketsSold(eventId: string | ObjectId, variantType: string, ticketCount: number): Promise<EventEntity | null>;
    listingEventsInAdminSide(pageNo: number): Promise<{ events: EventEntity[] | [], totalPages: number }>
    findEventByIdForTicketVerification(eventId: string): Promise<EventEntity | null>
    eventDetailsForAdminDashboard(): Promise<EventDashboardDTO>
}