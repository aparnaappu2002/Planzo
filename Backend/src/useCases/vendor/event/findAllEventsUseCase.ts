import { FindEventVendorDTO } from "../../../domain/dto/event/findEventVendorDTO";
import { EventEntity } from "../../../domain/entities/event/eventEntity";
import { IeventRepository } from "../../../domain/interfaces/repositoryInterfaces/event/IeventRepository";
import { IfindAllEventsVendorUseCase } from "../../../domain/interfaces/useCaseInterfaces/vendor/event/IfindAllEventsUseCase";
import { mapEventEntityVendorToDTO } from "../../mappers/eventVendorMapper";

export class FindAllEventsVendorUseCase implements IfindAllEventsVendorUseCase {
    private eventsDatabase: IeventRepository
    constructor(eventsDatabase: IeventRepository) {
        this.eventsDatabase = eventsDatabase
    }
    async findAllEvents(vendorId: string, pageNo: number): Promise<{ events: FindEventVendorDTO[]; totalPages: number; }> {
        const { events, totalPages } = await this.eventsDatabase.findEventsOfAVendor(vendorId, pageNo)
        return {
            events: events.map(mapEventEntityVendorToDTO),
            totalPages
        };

    }
}