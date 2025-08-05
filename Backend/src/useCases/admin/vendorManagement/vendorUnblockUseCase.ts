import { IvendorDatabaseRepositoryInterface } from "../../../domain/interfaces/repositoryInterfaces/vendor/vendorDatabaseRepository";
import { IvendorUnblockUseCase } from "../../../domain/interfaces/useCaseInterfaces/admin/vendorManagement/IvendorUnblockUseCase";


export class VendorUnblockUseCase implements IvendorUnblockUseCase{
    private vendorDatabase:IvendorDatabaseRepositoryInterface
    constructor(vendorDatabase:IvendorDatabaseRepositoryInterface){
        this.vendorDatabase=vendorDatabase
    }
    async vendorUnblock(vendorId: string): Promise<boolean> {
        const unblockedUser = await this.vendorDatabase.unblockVendor(vendorId)
        if(!unblockedUser) throw new Error('There is no vendor in this ID')
        return true
    }
}