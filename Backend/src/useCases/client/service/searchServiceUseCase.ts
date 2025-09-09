import { ServiceEntity } from "../../../domain/entities/serviceEntity";
import { IserviceRepository } from "../../../domain/interfaces/repositoryInterfaces/service/IserviceRepository";
import { IsearchServiceUseCase } from "../../../domain/interfaces/useCaseInterfaces/client/service/IsearchServiceUseCase";

export class SearchServiceUseCase implements IsearchServiceUseCase {
    private serviceDatabase: IserviceRepository
    constructor(serviceDatabase: IserviceRepository) {
        this.serviceDatabase = serviceDatabase
    }
    async searchService(query: string): Promise<ServiceEntity[] | []> {
        return await this.serviceDatabase.searchService(query)
    }
}