import { Request,Response,Router } from "express";
import { injectedVendorAuthenticationController,
    injectedVendorLoginController,injectedSendEmailForgetPasswordVendorController,
    injectedForgotPasswordVendorController,injectedResendOtpVendorController
 } from "../../inject/vendorInject";


export class VendorRoute{
    public vendorRoute:Router
    constructor(){
        this.vendorRoute=Router()
        this.setRoute()
    }

    private setRoute(){
        this.vendorRoute.post('/sendOtp',(req:Request,res:Response)=>{
            injectedVendorAuthenticationController.sendOtp(req,res)
        })
        this.vendorRoute.post('/signup',(req:Request,res:Response)=>{
            injectedVendorAuthenticationController.registerVendor(req,res)
        })
        this.vendorRoute.post('/login',(req:Request,res:Response)=>{
            injectedVendorLoginController.handleLoginVendor(req,res)
        })
        this.vendorRoute.post('/resendOtp',(req:Request,res:Response)=>{
            injectedResendOtpVendorController.handleResendOtp(req,res)
        })
        this.vendorRoute.post('/sendEmailForgotPassword',(req:Request,res:Response)=>{
            injectedSendEmailForgetPasswordVendorController.handleSendEmailForgetPasswordVendor(req,res)
        })
        this.vendorRoute.post('/resetForgorPassword',(req:Request,res:Response)=>{
            injectedForgotPasswordVendorController.handleResetPasswordVendor(req,res)
        })
    }
}