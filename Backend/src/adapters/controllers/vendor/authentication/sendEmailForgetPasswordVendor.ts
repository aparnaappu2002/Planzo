import { Request,Response } from "express";
import { IsendEmailForgetPasswordVendor } from "../../../../domain/interfaces/useCaseInterfaces/vendor/authentication/IsendEmailForgetPasswordVendor";
import { HttpStatus } from "../../../../domain/entities/httpStatus";

export class sendEmailForgetPasswordVendorController{
    private sendEmailForgetPasswordVendor:IsendEmailForgetPasswordVendor

    constructor(sendEmailForgetPasswordVendor:IsendEmailForgetPasswordVendor){
        this.sendEmailForgetPasswordVendor=sendEmailForgetPasswordVendor
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
}