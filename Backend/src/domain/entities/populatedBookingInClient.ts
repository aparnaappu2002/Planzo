import { BookingsInClientEntity } from "./bookingsInClientEntity";
import { ServiceBookingDTO } from "./serviceBookingDTO";
import { VendorDTO } from "./VendorDTO";

export interface PopulatedBooking extends Omit<BookingsInClientEntity, 'vendorId' | 'serviceId'> {
    vendorId: VendorDTO,
    serviceId: ServiceBookingDTO
}