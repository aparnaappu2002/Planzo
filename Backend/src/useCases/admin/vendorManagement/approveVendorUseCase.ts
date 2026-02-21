import { IvendorDatabaseRepositoryInterface } from "../../../domain/interfaces/repositoryInterfaces/vendor/vendorDatabaseRepository";
import { IapproveVendorUseCase } from "../../../domain/interfaces/useCaseInterfaces/admin/vendorManagement/IapproveVendorUseCase";
import { VendorStatus } from "../../../domain/enums/vendorStatus";
import { mapVendorEntityToDTO } from "../../mappers/vendorMapper";
import { FindVendorDTO } from "../../../domain/dto/vendor/findVendorDTO";

export class ApproveVendorUseCase implements IapproveVendorUseCase {
    private vendorDatabase: IvendorDatabaseRepositoryInterface
    constructor(vendorDatabase: IvendorDatabaseRepositoryInterface) {
        this.vendorDatabase = vendorDatabase
    }
    async approveVendor(vendorId: string, newStatus: VendorStatus): Promise<FindVendorDTO> {
        
        if (!vendorId || vendorId.trim().length === 0) {
            throw new Error('Vendor ID is required');
        }
        if (!newStatus) {
            throw new Error('Status is required');
        }
        const validStatuses = Object.values(VendorStatus);
        if (!validStatuses.includes(newStatus)) {
            throw new Error('Invalid vendor status');
        }

        const vendorExisting = await this.vendorDatabase.findById(vendorId)
        if (!vendorExisting) throw new Error('There is no vendor exists in this ID')
        const vendor = await this.vendorDatabase.changeVendorStatus(vendorId, newStatus)
        return mapVendorEntityToDTO(vendor);

    }
}