import { ServiceEntity } from "../../../domain/entities/serviceEntity";
import { IserviceRepository } from "../../../domain/interfaces/repositoryInterfaces/service/IserviceRepository";
import { IcreateServiceUseCase } from "../../../domain/interfaces/useCaseInterfaces/vendor/service/IcreateServiceUseCase";

export class CreateServiceUseCase implements IcreateServiceUseCase {
    private serviceDatabase: IserviceRepository
    constructor(serviceDatabase: IserviceRepository) {
        this.serviceDatabase = serviceDatabase
    }
    async createService(service: ServiceEntity): Promise<ServiceEntity> {
        return await this.serviceDatabase.createService(service)
    }
}