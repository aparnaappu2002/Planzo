import { VendorEntity } from "../../../domain/entities/vendorEntitty";
import { IvendorDatabaseRepositoryInterface } from "../../../domain/interfaces/repositoryInterfaces/vendor/vendorDatabaseRepository";
import { IloginVendorUseCase } from "../../../domain/interfaces/useCaseInterfaces/vendor/authentication/IloginVendorUseCase";
import { hashPassword } from "../../../framework/hashpassword/hashPassword";

export class LoginVendorUseCase implements IloginVendorUseCase{
    private vendorDatabase:IvendorDatabaseRepositoryInterface
    private hashPassword:hashPassword
    constructor(vendorDatabase:IvendorDatabaseRepositoryInterface){
        this.vendorDatabase=vendorDatabase
        this.hashPassword=new hashPassword()
    }

    async loginVendor(email: string, password: string): Promise<VendorEntity | null> {
        if (!email || email.trim().length === 0) {
            throw new Error('Email is required');
        }
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email.trim())) {
            throw new Error('Invalid email format');
        }
        if (!password || password.trim().length === 0) {
            throw new Error('Password is required');
        }

        if (password.length < 6) {
            throw new Error('Password must be at least 6 characters');
        }
        
        const vendor=await this.vendorDatabase.findByEmaill(email)
        console.log("Vendor:",vendor)
        if(!vendor) throw new Error("No vendor exists in the email")
        if(vendor.status=='block') 
            throw new Error("You are blocked by admin")
        const verifyPassword=await this.hashPassword.comparePassword(password,vendor.password)
        if(!verifyPassword) throw new Error("Invalid password")
        return vendor
    }
}