import { Request,Response } from "express";
import { IresetPasswordClientUseCase } from "../../../../domain/interfaces/useCaseInterfaces/client/authentication/IforgotPassword";
import { HttpStatus } from "../../../../domain/entities/httpStatus";

export class ResetForgtoPasswordClient {
    private resetPasswordClientUseCase:IresetPasswordClientUseCase
    constructor(resetPasswordClientUseCase:IresetPasswordClientUseCase){
        this.resetPasswordClientUseCase=resetPasswordClientUseCase
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