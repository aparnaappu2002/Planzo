import { ServiceEntity } from "../../../domain/entities/serviceEntity";
import { IserviceRepository } from "../../../domain/interfaces/repositoryInterfaces/service/IserviceRepository";
import { IeditServiceUseCase } from "../../../domain/interfaces/useCaseInterfaces/vendor/service/IeditServiceUseCase";

export class EditServiceUseCase implements IeditServiceUseCase {
    private serviceDatabase: IserviceRepository
    constructor(serviceDatabase: IserviceRepository) {
        this.serviceDatabase = serviceDatabase
    }
    async editService(service: ServiceEntity, serviceId: string): Promise<ServiceEntity | null> {
        const updateService = await this.serviceDatabase.editService(service, serviceId)
        if (!updateService) throw new Error('There is no service in this ID')
        return updateService
    }
}