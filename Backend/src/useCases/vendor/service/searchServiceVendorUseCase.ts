import { ServiceEntity } from "../../../domain/entities/serviceEntity";
import { IserviceRepository } from "../../../domain/interfaces/repositoryInterfaces/service/IserviceRepository";
import { IsearchServiceVendorUseCase } from "../../../domain/interfaces/useCaseInterfaces/vendor/service/IsearchServiceVendorUseCase";

export class SearchServiceVendorUseCase implements IsearchServiceVendorUseCase {
    private serviceDatabase: IserviceRepository;
    
    constructor(serviceDatabase: IserviceRepository) {
        this.serviceDatabase = serviceDatabase;
    }
    
    async searchServiceVendor(
        vendorId: string, 
        searchTerm: string, 
        pageNo: number
    ): Promise<{ Services: ServiceEntity[] | []; totalPages: number; }> {
        if (!vendorId || !searchTerm.trim()) {
            return { Services: [], totalPages: 0 };
        }
        
        const { Services, totalPages } = await this.serviceDatabase.searchServiceOfAVendor(
            vendorId, 
            searchTerm.trim(), 
            pageNo
        );
        
        return { Services, totalPages };
    }
}
