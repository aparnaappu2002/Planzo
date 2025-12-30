import { IbookingRepository } from "../../../domain/interfaces/repositoryInterfaces/booking/IbookingRepository";
import { IeventRepository } from "../../../domain/interfaces/repositoryInterfaces/event/IeventRepository";
import { IpdfServiceVendor } from "../../../domain/interfaces/serviceInterface/IpdfServiceVendor";
import { IpdfGenerateVendorUseCase  } from "../../../domain/interfaces/useCaseInterfaces/vendor/dashboard/IpdfGenerateVendorUseCase";
export class PdfGenerateVendorUseCase implements IpdfGenerateVendorUseCase {
    private eventDatabase: IeventRepository
    private bookingDatabase: IbookingRepository
    private pdfServiceVendor: IpdfServiceVendor
    constructor(eventDatabase: IeventRepository, bookingDatabase: IbookingRepository, pdfServiceVendor: IpdfServiceVendor) {
        this.eventDatabase = eventDatabase
        this.bookingDatabase = bookingDatabase
        this.pdfServiceVendor = pdfServiceVendor
    }
    async execute(vendorId: string): Promise<Buffer> {
        const events = await this.eventDatabase.findAllEventsOfAVendor(vendorId)

        const bookings = await this.bookingDatabase.findBookingsOfAVendor(vendorId)
        console.log("Bookings:",bookings)

        return await this.pdfServiceVendor.generateVendorReportPdf({ events, bookings });
    }
}