import { ServiceEntity } from "../../../../entities/serviceEntity";

export interface IsearchServiceVendorUseCase {
    
    
    searchServiceVendor(
        vendorId: string, 
        searchTerm: string, 
        pageNo: number
    ): Promise<{ 
        Services: ServiceEntity[] | []; 
        totalPages: number; 
    }>;
}
