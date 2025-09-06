import { ServiceEntity } from "../../../domain/entities/serviceEntity";
import { IserviceRepository } from "../../../domain/interfaces/repositoryInterfaces/service/IserviceRepository";
import { IfindServiceUseCaseInterface } from "../../../domain/interfaces/useCaseInterfaces/vendor/service/IfindServiceUseCaseInterface";

export class FindServiceUseCase implements IfindServiceUseCaseInterface {
    private serviceDatabase: IserviceRepository
    constructor(serviceDatabase: IserviceRepository) {
        this.serviceDatabase = serviceDatabase
    }
    async findService(vendorId: string, pageNo: number): Promise<{ Services: ServiceEntity[] | []; totalPages: number; }> {
        const { Services, totalPages } = await this.serviceDatabase.findServiceOfAVendor(vendorId, pageNo)
        return { Services, totalPages }
    }
}