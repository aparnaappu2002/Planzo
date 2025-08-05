import { ISearchVendorsUseCase } from "../../../domain/interfaces/useCaseInterfaces/admin/vendorManagement/IsearchVendorUseCase";
import { IvendorDatabaseRepositoryInterface } from "../../../domain/interfaces/repositoryInterfaces/vendor/vendorDatabaseRepository";
import { VendorEntity } from "../../../domain/entities/vendorEntitty";

export class SearchVendorsUseCase implements ISearchVendorsUseCase {
    private vendorRepository: IvendorDatabaseRepositoryInterface;

    constructor(vendorRepository: IvendorDatabaseRepositoryInterface) {
        this.vendorRepository = vendorRepository;
    }

    async searchVendors(search: string): Promise<VendorEntity[]> {
        if (!search) throw new Error("Search query is required");
        return await this.vendorRepository.searchVendors(search);
    }
}