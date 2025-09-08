import { ServiceEntity } from "../../../domain/entities/serviceEntity";
import { IserviceRepository } from "../../../domain/interfaces/repositoryInterfaces/service/IserviceRepository";
import { IfindServiceOnCategorybasis } from "../../../domain/interfaces/useCaseInterfaces/client/service/IfindServiceServiceOnCategory";

export class FindServiceOnCategorybasisUseCase implements IfindServiceOnCategorybasis {
    private serviceDatabase: IserviceRepository
    constructor(serviceDatabase: IserviceRepository) {
        this.serviceDatabase = serviceDatabase
    }
    async findServiceBasedOnCatagory(categoryId: string | null, pageNo: number, sortBy: string ): Promise<{ Services: ServiceEntity[] | []; totalPages: number; }> {
        const { Services, totalPages } = await this.serviceDatabase.findServiceByCategory(categoryId, pageNo, sortBy, )
        return { Services, totalPages }
    }
}