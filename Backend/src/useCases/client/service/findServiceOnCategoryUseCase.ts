import { FindServiceDTO } from "../../../domain/dto/services/findServiceDTO";
import { IserviceRepository } from "../../../domain/interfaces/repositoryInterfaces/service/IserviceRepository";
import { IfindServiceOnCategorybasis } from "../../../domain/interfaces/useCaseInterfaces/client/service/IfindServiceServiceOnCategory";
import { mapServiceEntityToDTO } from "../../mappers/serviceMapper";

export class FindServiceOnCategorybasisUseCase implements IfindServiceOnCategorybasis {
    private serviceDatabase: IserviceRepository
    constructor(serviceDatabase: IserviceRepository) {
        this.serviceDatabase = serviceDatabase
    }
    async findServiceBasedOnCatagory(categoryId: string | null, pageNo: number, sortBy: string ): Promise<{ Services: FindServiceDTO[]; totalPages: number; }> {
        const { Services, totalPages } = await this.serviceDatabase.findServiceByCategory(categoryId, pageNo, sortBy, )
        return {
            Services: Services.map(mapServiceEntityToDTO),
            totalPages
        };
    }

}