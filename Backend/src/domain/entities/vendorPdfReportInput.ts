import { EventEntity } from "./event/eventEntity";
import { BookingPdfDTO } from "../dto/bookingPdfDTO";

export interface VendorPdfReportInput {
    events: EventEntity[];
    bookings: BookingPdfDTO[];
  }