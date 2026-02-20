import { FindEventVendorDTO } from "../../../../dto/event/findEventVendorDTO";

export interface IfindAllEventsVendorUseCase {
    findAllEvents(vendorId: string, pageNo: number): Promise<{ events: FindEventVendorDTO[], totalPages: number }>
}