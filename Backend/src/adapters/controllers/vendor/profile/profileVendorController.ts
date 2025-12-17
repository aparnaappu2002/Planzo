import { Request, Response } from "express";
import { IchangePasswordVendorUseCase } from "../../../../domain/interfaces/useCaseInterfaces/vendor/profile/IchangePasswordVendorUseCase";
import { HttpStatus } from "../../../../domain/enums/httpStatus";
import { IupdateDetailsVendor } from "../../../../domain/interfaces/useCaseInterfaces/vendor/profile/IupdateDetailsVendor";

export class ProfileVendorController {
    private changePasswordVendorUseCase: IchangePasswordVendorUseCase
    private updateDetailsVendorUseCase: IupdateDetailsVendor
    constructor(changePasswordVendorUseCase: IchangePasswordVendorUseCase,updateDetailsVendorUseCase: IupdateDetailsVendor) {
        this.changePasswordVendorUseCase = changePasswordVendorUseCase
        this.updateDetailsVendorUseCase=updateDetailsVendorUseCase
    }
    async handleChangePasswordVendor(req: Request, res: Response): Promise<void> {
        try {
            const { userId, newPassword, oldPassword } = req.body
            const changePassword = await this.changePasswordVendorUseCase.changePasswordVendor(userId, oldPassword,newPassword)
            res.status(HttpStatus.OK).json({ message: "Password changed" })
        } catch (error) {
            console.log('error while changing password vendor', error)
            res.status(HttpStatus.BAD_REQUEST).json({
                message: "error while changing password vendor",
                error: error instanceof Error ? error.message : 'error while Changing vendor password'
            })
        }
    }
    async handleUpdateAboutAndPhone(req: Request, res: Response): Promise<void> {
        try {
            const { id, about, phone, name } = req.body
            const updatedVendor = await this.updateDetailsVendorUseCase.updateDetailsVendor(id, about, phone, name)
            res.status(HttpStatus.OK).json({ message: "About and Phone Updated", updatedVendor })
        } catch (error) {
            console.log('Error while updating vendor about and phone', error)
            res.status(HttpStatus.BAD_REQUEST).json({
                message: "error while updating vendor about and phone",
                error: error instanceof Error ? error.message : 'error whiel updating vendor about and phone'
            })
        }
    }
}