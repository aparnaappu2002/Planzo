import { Request,Response } from "express";
import { IsendMailForgetPasswordClient } from "../../../../domain/interfaces/useCaseInterfaces/client/authentication/IsendMailForgetPassword";
import { HttpStatus } from "../../../../domain/entities/httpStatus";


export class sendResetEmailToClient{
    private sendResetEmailClientUseCase:IsendMailForgetPasswordClient

    constructor(sendResetEmailClientUseCase:IsendMailForgetPasswordClient){
        this.sendResetEmailClientUseCase=sendResetEmailClientUseCase
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
}