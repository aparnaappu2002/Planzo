import { VendorEntity } from "../../../domain/entities/vendorEntitty";
import { IvendorDatabaseRepositoryInterface } from "../../../domain/interfaces/repositoryInterfaces/vendor/vendorDatabaseRepository";
import { VendorModel } from "../../../framework/database/models/vendorModel";

enum VendorStatus{
    Approved = "approved",
    Rejected="rejected"
}

export class VendorDatabase implements IvendorDatabaseRepositoryInterface{
    async createVendor(vendor: VendorEntity): Promise<VendorEntity> {
        return await VendorModel.create(vendor)
    }
    async findByEmaill(email: string): Promise<VendorEntity | null> {
        return await VendorModel.findOne({email:email})
    }
    async resetPassword(vendorId: string, password: string): Promise<VendorEntity | null> {
        return await VendorModel.findOneAndUpdate({vendorId},{password},{new:true})
    }
}