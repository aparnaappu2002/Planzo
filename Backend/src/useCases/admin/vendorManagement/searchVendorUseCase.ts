import { ISearchVendorsUseCase } from "../../../domain/interfaces/useCaseInterfaces/admin/vendorManagement/IsearchVendorUseCase";
import { IvendorDatabaseRepositoryInterface } from "../../../domain/interfaces/repositoryInterfaces/vendor/vendorDatabaseRepository";
import { FindVendorDTO } from "../../../domain/dto/vendor/findVendorDTO";
import { mapVendorEntityToDTO } from "../../mappers/vendorMapper";

export class SearchVendorsUseCase implements ISearchVendorsUseCase {
    private vendorRepository: IvendorDatabaseRepositoryInterface;

    constructor(vendorRepository: IvendorDatabaseRepositoryInterface) {
        this.vendorRepository = vendorRepository;
    }

    async searchVendors(search: string): Promise<FindVendorDTO[]> {
        if (!search || search.trim().length === 0) throw new Error("Search query is required");
        const vendors= await this.vendorRepository.searchVendors(search);
        return vendors.map(mapVendorEntityToDTO);

    }
}