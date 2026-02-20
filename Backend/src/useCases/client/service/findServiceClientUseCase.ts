import { FindServiceDTO } from "../../../domain/dto/services/findServiceDTO";
import { IserviceRepository } from "../../../domain/interfaces/repositoryInterfaces/service/IserviceRepository";
import { IfindServiceUseCase } from "../../../domain/interfaces/useCaseInterfaces/client/service/IfindServiceUseCase";
import { mapServiceEntityToDTO } from "../../mappers/serviceMapper";

export class FindServiceUseCaseClient implements IfindServiceUseCase {
    private serviceDatabase: IserviceRepository
    constructor(serviceDatabase: IserviceRepository) {
        this.serviceDatabase = serviceDatabase
    }
    async findServiceForclient(pageNo: number): Promise<{ Services: FindServiceDTO[]; totalPages: number; }> {
        const { Services, totalPages } = await this.serviceDatabase.findServiceForClient(pageNo)
        return { Services: Services.map(mapServiceEntityToDTO), totalPages }
    }
}