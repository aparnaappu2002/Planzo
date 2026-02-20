import { Request,Response } from "express";
import { IvendorAuthenticationUseCase } from "../../../../domain/interfaces/useCaseInterfaces/vendor/authentication/IregisterVendorUseCase";
import { IsendOtpVendorInterface } from "../../../../domain/interfaces/useCaseInterfaces/vendor/authentication/IsendOtpVendorUseCase";
import { HttpStatus } from "../../../../domain/enums/httpStatus";
import { IresendOtpVendorUseCase } from "../../../../domain/interfaces/useCaseInterfaces/vendor/authentication/IresendOtpVendorUseCase";
import { handleErrorResponse,logError } from "../../../../framework/services/errorHandler";

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
            if (!vendor) {
                res.status(HttpStatus.BAD_REQUEST).json({
                    message: 'Vendor data is required'
                });
                return;
            }
            if (!vendor.email) {
                res.status(HttpStatus.BAD_REQUEST).json({
                    message: 'Email is required'
                });
                return;
            }

            await this.vendorSendOtp.execute(vendor.email)
            res.status(HttpStatus.OK).json({message:"otp sended ot the email"})
            return
        }catch(error){
            logError("Error while sending vendor OTP", error);
            res.status(HttpStatus.BAD_REQUEST).json({
                message: "Error while sending the OTP",
                error: error instanceof Error ? error.message : "Unknown error",
                stack: error instanceof Error ? error.stack : undefined
            });
        }
    }

    async registerVendor(req:Request,res:Response){
        try{
            const {formdata,enteredOtp}=req.body
            if (!enteredOtp) {
                res.status(HttpStatus.BAD_REQUEST).json({
                    message: 'OTP is required'
                });
                return;
            }
            if (!formdata.email) {
                res.status(HttpStatus.BAD_REQUEST).json({
                    message: 'Email is required'
                });
                return;
            }

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
            logError("Error while registering vendor", error);
            res.status(HttpStatus.BAD_REQUEST).json({
                message: "Error while verifying vendor",
                error: error instanceof Error ? error.message : "Unknown error",
                stack: error instanceof Error ? error.stack : undefined
            });
            return
        }

    }
    async handleResendOtp(req:Request,res:Response):Promise<void>{
        try{
            const {email}=req.body
            if (!email) {
                res.status(HttpStatus.BAD_REQUEST).json({
                    message: 'Email is required'
                });
                return;
            }
            

            await this.resendOtpVendoUseCase.resendOtp(email)
            res.status(HttpStatus.OK).json({
                message:"Resended the otp"
            })
        }catch(error){
            logError('Error while resending OTP for vendor', error);
            handleErrorResponse(req, res, error, "Error while resending OTP");
        }
    }
}