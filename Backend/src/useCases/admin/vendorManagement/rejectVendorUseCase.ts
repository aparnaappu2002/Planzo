import { FindVendorDTO } from "../../../domain/dto/vendor/findVendorDTO";
import { IvendorDatabaseRepositoryInterface } from "../../../domain/interfaces/repositoryInterfaces/vendor/vendorDatabaseRepository";
import { IrejectVendorUseCase } from "../../../domain/interfaces/useCaseInterfaces/admin/vendorManagement/IrejectVendorUseCase";
import { mapVendorEntityToDTO } from "../../mappers/vendorMapper";

export class RejectVendorUseCase implements IrejectVendorUseCase {
    private vendorDatabase: IvendorDatabaseRepositoryInterface
    constructor(vendorDatabase: IvendorDatabaseRepositoryInterface) {
        this.vendorDatabase = vendorDatabase
    }
    async rejectVendor(vendorid: string, newStatus: string, rejectionReason: string): Promise<FindVendorDTO> {
        
        if (!vendorid || vendorid.trim().length === 0) {
            throw new Error('Vendor ID is required');
        }
        if (!newStatus || newStatus.trim().length === 0) {
            throw new Error('Status is required');
        }
        
        const existingVendor = await this.vendorDatabase.findById(vendorid)
        if (!existingVendor) throw new Error('No vendor Exist')
        const vendor = await this.vendorDatabase.rejectPendingVendor(vendorid, newStatus, rejectionReason)
        return mapVendorEntityToDTO(vendor);

    }
}