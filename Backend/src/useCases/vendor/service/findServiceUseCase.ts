import { FindServiceDTO } from "../../../domain/dto/services/findServiceDTO";
import { IserviceRepository } from "../../../domain/interfaces/repositoryInterfaces/service/IserviceRepository";
import { IfindServiceUseCaseInterface } from "../../../domain/interfaces/useCaseInterfaces/vendor/service/IfindServiceUseCaseInterface";
import { mapServiceEntityToDTO } from "../../mappers/serviceMapper";

export class FindServiceUseCase implements IfindServiceUseCaseInterface {
    private serviceDatabase: IserviceRepository
    constructor(serviceDatabase: IserviceRepository) {
        this.serviceDatabase = serviceDatabase
    }
    async findService(vendorId: string, pageNo: number): Promise<{ Services: FindServiceDTO[]; totalPages: number; }> {
        const { Services, totalPages } = await this.serviceDatabase.findServiceOfAVendor(vendorId, pageNo)
        return { Services: Services.map(mapServiceEntityToDTO), totalPages }
    }
}