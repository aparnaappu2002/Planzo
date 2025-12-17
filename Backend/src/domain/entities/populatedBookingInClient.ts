import { BookingsInClientEntity } from "./bookingsInClientEntity";
import { ServiceBookingDTO } from "../dto/serviceBookingDTO";
import { VendorDTO } from "../dto/VendorDTO";

export interface PopulatedBooking extends Omit<BookingsInClientEntity, 'vendorId' | 'serviceId'> {
    vendorId: VendorDTO,
    serviceId: ServiceBookingDTO
}