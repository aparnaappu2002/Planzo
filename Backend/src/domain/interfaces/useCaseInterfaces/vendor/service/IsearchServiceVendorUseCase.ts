import { FindServiceDTO } from "../../../../dto/services/findServiceDTO";

export interface IsearchServiceVendorUseCase {
    
    
    searchServiceVendor(
        vendorId: string, 
        searchTerm: string, 
        pageNo: number
    ): Promise<{ 
        Services: FindServiceDTO[]; 
        totalPages: number; 
    }>;
}
