import { VendorEntity } from "../../../domain/entities/vendorEntitty";
import { IvendorDatabaseRepositoryInterface } from "../../../domain/interfaces/repositoryInterfaces/vendor/vendorDatabaseRepository";
import { IjwtInterface } from "../../../domain/interfaces/serviceInterface/IjwtService";
import { hashPassword } from "../../../framework/hashpassword/hashPassword";
import { IForgotPasswordVendorUseCase } from "../../../domain/interfaces/useCaseInterfaces/vendor/authentication/IForgotPasswordVendor";

export class ResetPasswordVendorUseCase implements IForgotPasswordVendorUseCase{
    private jwtService:IjwtInterface
    private vendorDatabase:IvendorDatabaseRepositoryInterface
    private hashPassword:hashPassword
    
    constructor(jwtService:IjwtInterface,vendorDatabase:IvendorDatabaseRepositoryInterface){
        this.jwtService=jwtService
        this.vendorDatabase=vendorDatabase
        this.hashPassword=new hashPassword()
    }

    async resetPasswordVendor(email: string, newPassword: string, token: string): Promise<void> {
        const isValidToken=await this.jwtService.verifyPasswordResetToken(token,process.env.RESET_SECRET_KEY!)
        if(!isValidToken){
            throw new Error("Invalid or expired reset token")
        }
        const vendor=await this.vendorDatabase.findByEmaill(email)
        if(!vendor){
            throw new Error("No vendor found with this email")
        }
        const hashedPassword=await this.hashPassword.hashPassword(newPassword)
        const updateVendor= await this.vendorDatabase.resetPassword(vendor.vendorId,hashedPassword)

        if(!updateVendor){
            throw new Error("Failed to update password. Vendor may no longer exist")
        }
    }
}