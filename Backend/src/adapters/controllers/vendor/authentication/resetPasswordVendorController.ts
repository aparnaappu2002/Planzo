import { Request,Response } from "express";
import { IForgotPasswordVendorUseCase } from "../../../../domain/interfaces/useCaseInterfaces/vendor/authentication/IForgotPasswordVendor";
import { HttpStatus } from "../../../../domain/entities/httpStatus";

export class ResetPasswordVendorController{
    private resetPasswordVendorUseCase:IForgotPasswordVendorUseCase
    constructor(resetPasswordVendorUseCase:IForgotPasswordVendorUseCase){
        this.resetPasswordVendorUseCase=resetPasswordVendorUseCase
    }

    async handleResetPasswordVendor(req:Request,res:Response):Promise<void>{
        try{
            const {email,newPassword,token}=req.body
            const updatedClient=await this.resetPasswordVendorUseCase.resetPasswordVendor(email,newPassword,token)
            res.status(HttpStatus.OK).json({
                message:"Password reset successfully",
                client:updatedClient
            })
        }catch(error){
            console.log("Error while resetting the password:",error)
            res.status(HttpStatus.BAD_REQUEST).json({
                message:"Error while resetting password",
                error:error instanceof Error ? error.message: "Error while resetting the password"
            })
        }
    }
}