import { VendorEntity } from "../../../domain/entities/vendorEntitty";
import { IvendorDatabaseRepositoryInterface } from "../../../domain/interfaces/repositoryInterfaces/vendor/vendorDatabaseRepository";
import { IfindAllVendorUseCase } from "../../../domain/interfaces/useCaseInterfaces/admin/vendorManagement/IfindVendorAllUseCase";

export class FindAllVendorUseCase implements IfindAllVendorUseCase{
    private vendorDatabase:IvendorDatabaseRepositoryInterface
    constructor(vendorDatabase:IvendorDatabaseRepositoryInterface){
        this.vendorDatabase=vendorDatabase
    }
    async findAllVendor(pageNo: number): Promise<{ vendors: VendorEntity[] | []; totalPages: number; }> {
        const {Vendors,totalPages} = await this.vendorDatabase.findAllVendors(pageNo)
        return {vendors:Vendors,totalPages}
    }
}