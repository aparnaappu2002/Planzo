import { IvendorDatabaseRepositoryInterface } from "../../../domain/interfaces/repositoryInterfaces/vendor/vendorDatabaseRepository";
import { IfindPendingVendors } from "../../../domain/interfaces/useCaseInterfaces/admin/vendorManagement/IfindPendingVendors";
import { mapVendorEntityToDTO } from "../../mappers/vendorMapper";
import { FindVendorDTO } from "../../../domain/dto/vendor/findVendorDTO";
export class FindAllPendingVendorsUseCase implements IfindPendingVendors {
    private vendorDatabase: IvendorDatabaseRepositoryInterface
    constructor(vendorDatabase: IvendorDatabaseRepositoryInterface) {
        this.vendorDatabase = vendorDatabase
    }
    async findPendingVendors(pageNo: number): Promise<{ pendingVendors: FindVendorDTO[]; totalPages: number; }> {
        const {pendingVendors,totalPages} = await this.vendorDatabase.findAllPendingVendors(pageNo)
        return {
            pendingVendors: pendingVendors.map(mapVendorEntityToDTO),
            totalPages
        };

    }
}