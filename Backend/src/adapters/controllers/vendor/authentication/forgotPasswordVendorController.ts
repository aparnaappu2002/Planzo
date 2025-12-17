import { Request,Response } from "express";
import { IsendEmailForgetPasswordVendor } from "../../../../domain/interfaces/useCaseInterfaces/vendor/authentication/IsendEmailForgetPasswordVendor";
import { HttpStatus } from "../../../../domain/enums/httpStatus";
import { IForgotPasswordVendorUseCase } from "../../../../domain/interfaces/useCaseInterfaces/vendor/authentication/IForgotPasswordVendor";

export class ForgotPasswordVendorController{
    private sendEmailForgetPasswordVendor:IsendEmailForgetPasswordVendor
     private resetPasswordVendorUseCase:IForgotPasswordVendorUseCase

    constructor(sendEmailForgetPasswordVendor:IsendEmailForgetPasswordVendor,resetPasswordVendorUseCase:IForgotPasswordVendorUseCase){
        this.sendEmailForgetPasswordVendor=sendEmailForgetPasswordVendor
        this.resetPasswordVendorUseCase=resetPasswordVendorUseCase
    }

    async handleSendEmailForgetPasswordVendor(req:Request,res:Response):Promise<void>{
        try{
            const {email}=req.body
            await this.sendEmailForgetPasswordVendor.sendEmailForgetPasswordVendor(email)
            res.status(HttpStatus.OK).json({
                message:"Reset email sent successfully"
            })
        }catch(error){
            console.log("Error while sending reset email:",error)
            res.status(HttpStatus.BAD_REQUEST).json({
                message:"Error while sending reset email",
                error:error instanceof Error ? error.message:"Error while sending reset email"
            })
        }
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