import { Request,Response } from "express";
import { IsendMailForgetPasswordClient } from "../../../../domain/interfaces/useCaseInterfaces/client/authentication/IsendMailForgetPassword";
import { HttpStatus } from "../../../../domain/entities/httpStatus";
import { IresetPasswordClientUseCase } from "../../../../domain/interfaces/useCaseInterfaces/client/authentication/IforgotPassword";


export class ForgotPasswordClient{
    private sendResetEmailClientUseCase:IsendMailForgetPasswordClient
    private resetPasswordClientUseCase:IresetPasswordClientUseCase
    constructor(sendResetEmailClientUseCase:IsendMailForgetPasswordClient,resetPasswordClientUseCase:IresetPasswordClientUseCase){
        this.sendResetEmailClientUseCase=sendResetEmailClientUseCase
        this.resetPasswordClientUseCase=resetPasswordClientUseCase
    }

    async handleSendResetEmail(req:Request,res:Response):Promise<void>{
        try{
            const {email}=req.body
            await this.sendResetEmailClientUseCase.sendMailForForgetPassword(email)
            res.status(HttpStatus.OK).json({message:"Reset email sent successfully"})
        }catch(error){
            console.log("Error while sending reset email:",error)
            res.status(HttpStatus.BAD_REQUEST).json({
                message:"Error while sending reset email",
                error:error instanceof Error ? error.message:"Error while sending reset email"
            })
        }
    }
    async handleResetPassword(req:Request,res:Response):Promise<void>{
        try{
            const {email,newPassword,token}=req.body
            const updatedClient = await this.resetPasswordClientUseCase.resetPassword(email,newPassword,token)
            res.status(HttpStatus.OK).json({
                message:"Password reset successfully",
                client: updatedClient
            })
        }catch(error){
            console.log("Error while resetting password:",error)
            res.status(HttpStatus.BAD_REQUEST).json({
                message:"Error while resetting password",
                error: error instanceof Error ? error.message :"Error while resetting password"
            })
        }
    }
}