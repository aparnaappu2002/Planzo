import { IvendorDatabaseRepositoryInterface } from "../../../domain/interfaces/repositoryInterfaces/vendor/vendorDatabaseRepository";
import { IhashPassword } from "../../../domain/interfaces/serviceInterface/IhashPassword";
import { IchangePasswordVendorUseCase } from "../../../domain/interfaces/useCaseInterfaces/vendor/profile/IchangePasswordVendorUseCase";

export class ChangePasswordVendorUseCase implements IchangePasswordVendorUseCase {
    private vendorDatabase: IvendorDatabaseRepositoryInterface
    private hashPassword: IhashPassword
    constructor(vendorDatabase: IvendorDatabaseRepositoryInterface, hashPassword: IhashPassword) {
        this.vendorDatabase = vendorDatabase
        this.hashPassword = hashPassword
    }
    async changePasswordVendor(vendorId: string, newPassword: string, oldPassword: string): Promise<boolean> {
        if (!vendorId || vendorId.trim().length === 0) {
            throw new Error('Vendor ID is required');
        }
        if (!oldPassword || oldPassword.trim().length === 0) {
            throw new Error('Old password is required');
        }
        if (!newPassword || newPassword.trim().length === 0) {
            throw new Error('New password is required');
        }
        if (newPassword.length < 6) {
            throw new Error('New password must be at least 6 characters');
        }
        if (newPassword.length > 128) {
            throw new Error('New password is too long');
        }
        
        const passwordInDb = await this.vendorDatabase.findPassword(vendorId)
        if (!passwordInDb) throw new Error("No vendor Found in this ID")
        const verifyOldPassword = await this.hashPassword.comparePassword(oldPassword, passwordInDb)
        if (!verifyOldPassword) throw new Error("Old password is not correct")
        const checkNewPasswordWithOld = await this.hashPassword.comparePassword(newPassword, passwordInDb)
        if (checkNewPasswordWithOld) throw new Error('Cant use old password as new password')
        const hashedPassword = await this.hashPassword.hashPassword(newPassword)
        if (!hashedPassword) throw new Error('Error while hashing password')
        return await this.vendorDatabase.changePassword(vendorId, hashedPassword)

    }
}