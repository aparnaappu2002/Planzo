import { ClientDTO } from "../../dto/ClientDTO";
import { ServiceBookingDTO } from "../../dto/serviceBookingDTO";
import { BookingListingEntityVendor } from "./bookingListingEntityVendor";

export interface PopulatedBookingEntityVendor extends Omit<BookingListingEntityVendor, 'clientId' | 'serviceId'> {
    clientId: ClientDTO,
    serviceId: ServiceBookingDTO
}