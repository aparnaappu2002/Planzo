import { Request,Response } from "express";
import { IsendEmailForgetPasswordVendor } from "../../../../domain/interfaces/useCaseInterfaces/vendor/authentication/IsendEmailForgetPasswordVendor";
import { HttpStatus } from "../../../../domain/enums/httpStatus";
import { IForgotPasswordVendorUseCase } from "../../../../domain/interfaces/useCaseInterfaces/vendor/authentication/IForgotPasswordVendor";
import { handleErrorResponse,logError } from "../../../../framework/services/errorHandler";

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
            if (!email) {
                res.status(HttpStatus.BAD_REQUEST).json({
                    message: 'Email is required'
                });
                return;
            }
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(email.trim())) {
                res.status(HttpStatus.BAD_REQUEST).json({
                    message: 'Invalid email format'
                });
                return;
            }

            await this.sendEmailForgetPasswordVendor.sendEmailForgetPasswordVendor(email)
            res.status(HttpStatus.OK).json({
                message:"Reset email sent successfully"
            })
        }catch(error){
            logError("Error while sending vendor reset email", error);
            handleErrorResponse(req, res, error, "Error while sending reset email");
        }
    }
    async handleResetPasswordVendor(req:Request,res:Response):Promise<void>{
        try{
            const {email,newPassword,token}=req.body
            if (!email) {
                res.status(HttpStatus.BAD_REQUEST).json({
                    message: 'Email is required'
                });
                return;
            }
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(email.trim())) {
                res.status(HttpStatus.BAD_REQUEST).json({
                    message: 'Invalid email format'
                });
                return;
            }
            if (!newPassword) {
                res.status(HttpStatus.BAD_REQUEST).json({
                    message: 'New password is required'
                });
                return;
            }

            if (newPassword.length < 6) {
                res.status(HttpStatus.BAD_REQUEST).json({
                    message: 'Password must be at least 6 characters'
                });
                return;
            }
            
            const updatedClient=await this.resetPasswordVendorUseCase.resetPasswordVendor(email,newPassword,token)
            res.status(HttpStatus.OK).json({
                message:"Password reset successfully",
                client:updatedClient
            })
        }catch(error){
            logError("Error while resetting vendor password", error);
            handleErrorResponse(req, res, error, "Error while resetting password");
        }
    }
}