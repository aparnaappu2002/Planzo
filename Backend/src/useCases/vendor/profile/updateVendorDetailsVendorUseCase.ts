import { VendorEntity } from "../../../domain/entities/vendorEntitty";
import { IvendorDatabaseRepositoryInterface } from "../../../domain/interfaces/repositoryInterfaces/vendor/vendorDatabaseRepository";
import { IupdateDetailsVendor} from "../../../domain/interfaces/useCaseInterfaces/vendor/profile/IupdateDetailsVendor";

export class updateDetailsVendorUseCase implements IupdateDetailsVendor {
    private vendorDatabase: IvendorDatabaseRepositoryInterface
    constructor(vendorDatabase: IvendorDatabaseRepositoryInterface) {
        this.vendorDatabase = vendorDatabase
    }
    async updateDetailsVendor(vendorId: string, about: string, phone: string, name: string): Promise<VendorEntity> {
        const updatedVendor = await this.vendorDatabase.updateDetailsVendor(vendorId, about, phone,name)
        if(!updatedVendor) throw new Error('No vendor found in this ID')
        return updatedVendor
    }
}