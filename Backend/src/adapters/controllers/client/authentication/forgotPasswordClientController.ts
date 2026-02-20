import { Request,Response } from "express";
import { IsendMailForgetPasswordClient } from "../../../../domain/interfaces/useCaseInterfaces/client/authentication/IsendMailForgetPassword";
import { HttpStatus } from "../../../../domain/enums/httpStatus";
import { IresetPasswordClientUseCase } from "../../../../domain/interfaces/useCaseInterfaces/client/authentication/IforgotPassword";
import { Messages } from "../../../../domain/enums/messages";
import { handleErrorResponse,logError } from "../../../../framework/services/errorHandler";


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
            res.status(HttpStatus.OK).json({message:Messages.PASSWORD_RESET_SENT})
        }catch(error){
            logError("Error while sending reset email", error);
            handleErrorResponse(req, res, error, Messages.PASSWORD_RESET_SENT_ERROR);
        }
    }
    async handleResetPassword(req:Request,res:Response):Promise<void>{
        try{
            const {email,newPassword,token}=req.body
            const updatedClient = await this.resetPasswordClientUseCase.resetPassword(email,newPassword,token)
            res.status(HttpStatus.OK).json({
                message:Messages.PASSWORD_RESET_SUCCESS,
                client: updatedClient
            })
        }catch(error){
            logError("Error while resetting password", error);
            handleErrorResponse(req, res, error, Messages.PASSWORD_RESET_ERROR);
        }
    }
}