import { VendorEntity } from "../../../domain/entities/vendorEntitty";
import { IvendorDatabaseRepositoryInterface } from "../../../domain/interfaces/repositoryInterfaces/vendor/vendorDatabaseRepository";
import { IapproveVendorUseCase } from "../../../domain/interfaces/useCaseInterfaces/admin/vendorManagement/IapproveVendorUseCase";

enum VendorStatus {
    Approved = 'approved',
    Rejected = 'rejected'
}
export class ApproveVendorUseCase implements IapproveVendorUseCase {
    private vendorDatabase: IvendorDatabaseRepositoryInterface
    constructor(vendorDatabase: IvendorDatabaseRepositoryInterface) {
        this.vendorDatabase = vendorDatabase
    }
    async approveVendor(vendorId: string, newStatus: VendorStatus): Promise<VendorEntity> {
        const vendorExisting = await this.vendorDatabase.findById(vendorId)
        if (!vendorExisting) throw new Error('There is no vendor exists in this ID')
        const vendor = await this.vendorDatabase.changeVendorStatus(vendorId, newStatus)
        return vendor
    }
}