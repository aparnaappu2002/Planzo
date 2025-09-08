import { ServiceEntity } from "../../../domain/entities/serviceEntity";
import { IserviceRepository } from "../../../domain/interfaces/repositoryInterfaces/service/IserviceRepository";
import { IfindServiceUseCase } from "../../../domain/interfaces/useCaseInterfaces/client/service/IfindServiceUseCase";

export class FindServiceUseCaseClient implements IfindServiceUseCase {
    private serviceDatabase: IserviceRepository
    constructor(serviceDatabase: IserviceRepository) {
        this.serviceDatabase = serviceDatabase
    }
    async findServiceForclient(pageNo: number): Promise<{ Services: ServiceEntity[] | []; totalPages: number; }> {
        const { Services, totalPages } = await this.serviceDatabase.findServiceForClient(pageNo)
        return { Services, totalPages }
    }
}