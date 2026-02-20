import { IserviceRepository } from "../../../domain/interfaces/repositoryInterfaces/service/IserviceRepository";
import { IchangeStatusServiceUseCase } from "../../../domain/interfaces/useCaseInterfaces/vendor/service/IchangeStatusServiceUseCase";

export class ChangeStatusServiceUseCase implements IchangeStatusServiceUseCase {
    private serviceDatabase: IserviceRepository
    constructor(serviceDatabase: IserviceRepository) {
        this.serviceDatabase = serviceDatabase
    }
    async changeStatus(serviceId: string): Promise<boolean> {
        if (!serviceId || serviceId.trim().length === 0) {
            throw new Error('Service ID is required');
        }
        const changeStatus = await this.serviceDatabase.changeStatus(serviceId)
        if (!changeStatus) throw new Error('No service found in this ID')
        return true
    }
}