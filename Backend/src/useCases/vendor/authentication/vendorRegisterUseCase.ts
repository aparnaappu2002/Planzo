import { VendorEntity } from "../../../domain/entities/vendorEntitty";
import { IvendorAuthenticationUseCase } from "../../../domain/interfaces/useCaseInterfaces/vendor/authentication/IregisterVendorUseCase";
import { IvendorDatabaseRepositoryInterface } from "../../../domain/interfaces/repositoryInterfaces/vendor/vendorDatabaseRepository";
import { hashPassword } from "../../../framework/hashpassword/hashPassword";
import { generateRandomUuid } from "../../../framework/services/randomUuid";

export class VendorRegisterUseCase implements IvendorAuthenticationUseCase{
    private vendorDatabase :IvendorDatabaseRepositoryInterface
    private hashPassword:hashPassword

    constructor(vendorDatabase:IvendorDatabaseRepositoryInterface){
        this.vendorDatabase=vendorDatabase
        this.hashPassword=new hashPassword()
    }
    async signupVendor(vendor: VendorEntity): Promise<VendorEntity | null> {
        const oldVendor = await this.vendorDatabase.findByEmaill(vendor.email)
        if(oldVendor) throw new Error ("Already vendor exist in this email")
        const hashedPassword = await this.hashPassword.hashPassword(vendor.password)
        const vendorId=generateRandomUuid()
        const newVendor = await this.vendorDatabase.createVendor({
            name: vendor.name,
            email: vendor.email,
            password: hashedPassword,
            role: 'vendor',
            vendorId,
            idProof: vendor.idProof,
            phone: vendor.phone,
            vendorStatus: 'pending'
        })
        return newVendor
    }
}