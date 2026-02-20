import { FindServiceDTO } from "../../../domain/dto/services/findServiceDTO";
import { ServiceEntity } from "../../../domain/entities/serviceEntity";
import { IserviceRepository } from "../../../domain/interfaces/repositoryInterfaces/service/IserviceRepository";
import { IsearchServiceVendorUseCase } from "../../../domain/interfaces/useCaseInterfaces/vendor/service/IsearchServiceVendorUseCase";
import { mapServiceEntityToDTO } from "../../mappers/serviceMapper";
export class SearchServiceVendorUseCase implements IsearchServiceVendorUseCase {
    private serviceDatabase: IserviceRepository;
    
    constructor(serviceDatabase: IserviceRepository) {
        this.serviceDatabase = serviceDatabase;
    }
    
    async searchServiceVendor(
        vendorId: string, 
        searchTerm: string, 
        pageNo: number
    ): Promise<{ Services: FindServiceDTO[]; totalPages: number; }> {
        if (!vendorId || !searchTerm.trim()) {
            return { Services: [], totalPages: 0 };
        }
        if (!searchTerm || searchTerm.trim().length === 0) {
            throw new Error('Search term is required');
        }
        const { Services, totalPages } = await this.serviceDatabase.searchServiceOfAVendor(
            vendorId, 
            searchTerm.trim(), 
            pageNo
        );
        
        return { Services: Services.map(mapServiceEntityToDTO), totalPages }
    }
}
