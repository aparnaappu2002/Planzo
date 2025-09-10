import { ClientDTO } from "../ClientDTO";
import { ServiceBookingDTO } from "../serviceBookingDTO";
import { BookingListingEntityVendor } from "./bookingListingEntityVendor";

export interface PopulatedBookingEntityVendor extends Omit<BookingListingEntityVendor, 'clientId' | 'serviceId'> {
    clientId: ClientDTO,
    serviceId: ServiceBookingDTO
}