import { FindVendorDTO } from "../../../domain/dto/vendor/findVendorDTO";
import { IvendorDatabaseRepositoryInterface } from "../../../domain/interfaces/repositoryInterfaces/vendor/vendorDatabaseRepository";
import { IfindAllVendorUseCase } from "../../../domain/interfaces/useCaseInterfaces/admin/vendorManagement/IfindVendorAllUseCase";
import { mapVendorEntityToDTO } from "../../mappers/vendorMapper";

export class FindAllVendorUseCase implements IfindAllVendorUseCase{
    private vendorDatabase:IvendorDatabaseRepositoryInterface
    constructor(vendorDatabase:IvendorDatabaseRepositoryInterface){
        this.vendorDatabase=vendorDatabase
    }
    async findAllVendor(pageNo: number): Promise<{ vendors: FindVendorDTO[]; totalPages: number; }> {
        const {Vendors,totalPages} = await this.vendorDatabase.findAllVendors(pageNo)
        return {
            vendors: Vendors.map(mapVendorEntityToDTO),
            totalPages
        };

    }
}