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
        if (!email || email.trim().length === 0) {
            throw new Error('Email is required');
        }
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email.trim())) {
            throw new Error('Invalid email format');
        }
        if (!newPassword || newPassword.trim().length === 0) {
            throw new Error('New password is required');
        }

        if (newPassword.length < 6) {
            throw new Error('Password must be at least 6 characters');
        }

        if (newPassword.length > 128) {
            throw new Error('Password is too long');
        }

        
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