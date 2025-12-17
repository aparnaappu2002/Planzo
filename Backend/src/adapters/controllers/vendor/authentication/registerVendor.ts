import { Request,Response } from "express";
import { IvendorAuthenticationUseCase } from "../../../../domain/interfaces/useCaseInterfaces/vendor/authentication/IregisterVendorUseCase";
import { IsendOtpVendorInterface } from "../../../../domain/interfaces/useCaseInterfaces/vendor/authentication/IsendOtpVendorUseCase";
import { HttpStatus } from "../../../../domain/enums/httpStatus";
import { IresendOtpVendorUseCase } from "../../../../domain/interfaces/useCaseInterfaces/vendor/authentication/IresendOtpVendorUseCase";

export class VendorAuthenticationController{
    private vendorAuthenticationUseCase:IvendorAuthenticationUseCase
    private vendorSendOtp:IsendOtpVendorInterface
    private resendOtpVendoUseCase: IresendOtpVendorUseCase

    constructor(vendorAuthenticationUseCase:IvendorAuthenticationUseCase,
        vendorSendOtp:IsendOtpVendorInterface,resendOtpVendorUseCase:IresendOtpVendorUseCase
    ){
        this.vendorAuthenticationUseCase=vendorAuthenticationUseCase
        this.vendorSendOtp=vendorSendOtp
        this.resendOtpVendoUseCase=resendOtpVendorUseCase
    }

    async sendOtp(req:Request,res:Response){
        try{
            const vendor=req.body
            await this.vendorSendOtp.execute(vendor.email)
            res.status(HttpStatus.OK).json({message:"otp sended ot the email"})
            return
        }catch(error){
            console.log("error while sending otp",error)
            res.status(HttpStatus.BAD_REQUEST).json({
                message:"Error while sending the otp",
                error: error instanceof Error ? error.message:"Unknown error",
                stack:error instanceof Error ? error.stack : undefined
            })
        }
    }

    async registerVendor(req:Request,res:Response){
        try{
            const {formdata,enteredOtp}=req.body
            console.log(req.body)
        const otpverification = await this.vendorSendOtp.verifyOtp(formdata.email,enteredOtp)
        if(!otpverification){
            res.status(HttpStatus.BAD_REQUEST).json({
                message:"Invalid otp"})
                return
        }
        const vendor=await this.vendorAuthenticationUseCase.signupVendor(formdata)
        res.status(HttpStatus.OK).json({
            message:"Vendor created",vendor
        })
        }catch(error){
            console.log("error while verifying otp",error)
            res.status(HttpStatus.BAD_REQUEST).json({
                message:"Error while verifying client",
                error:error instanceof Error ? error.message:"Unknown error",
                stack: error instanceof Error ? error.stack :undefined
            })
            return
        }

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