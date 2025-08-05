import { IvendorDatabaseRepositoryInterface } from "../../../domain/interfaces/repositoryInterfaces/vendor/vendorDatabaseRepository";
import { IvendorBlockUseCase } from "../../../domain/interfaces/useCaseInterfaces/admin/vendorManagement/IvendorBlockUseCase";

export class VendorBlockUseCase implements IvendorBlockUseCase{
    private vendorDatabase:IvendorDatabaseRepositoryInterface
    constructor(vendorDatabase:IvendorDatabaseRepositoryInterface){
        this.vendorDatabase=vendorDatabase
    }

    async blockVendor(vendorId: string): Promise<boolean> {
        const blockedUser = await this.vendorDatabase.blockVendor(vendorId)
        if(!blockedUser) throw new Error("There is no vendor in this ID")
        return true
    }
}