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
        if (!vendor) {
            throw new Error('Vendor data is required');
        }
        if (!vendor.name || vendor.name.trim().length < 2) {
            throw new Error('Name must be at least 2 characters');
        }

        if (vendor.name.trim().length > 50) {
            throw new Error('Name is too long');
        }
        if (!vendor.email || vendor.email.trim().length === 0) {
            throw new Error('Email is required');
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(vendor.email.trim())) {
            throw new Error('Invalid email format');
        }
        if (!vendor.password || vendor.password.trim().length === 0) {
            throw new Error('Password is required');
        }

        if (vendor.password.length < 6) {
            throw new Error('Password must be at least 6 characters');
        }

        if (vendor.password.length > 128) {
            throw new Error('Password is too long');
        }
        

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