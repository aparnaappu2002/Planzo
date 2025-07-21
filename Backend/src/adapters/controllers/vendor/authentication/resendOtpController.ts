import { Request,Response } from "express";
import { IresendOtpVendorUseCase } from "../../../../domain/interfaces/useCaseInterfaces/vendor/authentication/IresendOtpVendorUseCase";
import { HttpStatus } from "../../../../domain/entities/httpStatus";

export class ResendOtpVendorController{
    private resendOtpVendoUseCase: IresendOtpVendorUseCase

    constructor(resendOtpVendorUseCase:IresendOtpVendorUseCase){
        this.resendOtpVendoUseCase=resendOtpVendorUseCase
    }
    async handleResendOtp(req:Request,res:Response):Promise<void>{
        try{
            const {email}=req.body
            await this.resendOtpVendoUseCase.resendOtp(email)
            res.status(HttpStatus.OK).json({
                message:"Resended the otp"
            })
        }catch(error){
            console.log('error while resending otp in vendor',error)
            res.status(HttpStatus.BAD_REQUEST).json({
                message:"error while resending otp",
                error : error instanceof Error ? error.message : "error while resending otp"
            })
        }
    }
}