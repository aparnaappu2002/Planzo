import { Request,Response,Router } from "express";
import { ClientAuthenticationController } from "../../../adapters/controllers/client/authentication/clientAuthenticationController";
import { clientAuthenticationController,injectedClientLoginController,injectedSendMailForgetPasswordController,
    injectedForgotPasswordClientController,injectedGoogleLoginController
 } from "../../inject/clientInject";

export class clientRoute{
    public clientRoute:Router
    constructor(){
        this.clientRoute=Router()
        this.setRoute()
    }
    private setRoute(){
        

        this.clientRoute.post('/signup',(req:Request,res:Response)=>{
            clientAuthenticationController.sendOtp(req,res)
        })
        this.clientRoute.post('/createAccount',(req:Request,res:Response)=>{
            clientAuthenticationController.register(req,res)
        })
        this.clientRoute.post('/resendOtp',(req:Request,res:Response)=>{
            clientAuthenticationController.resendOtp(req,res)
        })
        this.clientRoute.post('/login',(req:Request,res:Response)=>{
            injectedClientLoginController.handleLogin(req,res)
        })
        this.clientRoute.post('/sendForgotPassword',(req:Request,res:Response)=>{
            injectedSendMailForgetPasswordController.handleSendResetEmail(req,res)
        })
        this.clientRoute.post('/forgotPassword',(req:Request,res:Response)=>{
            injectedForgotPasswordClientController.handleResetPassword(req,res)
        })
        this.clientRoute.post('/googleLogin',(req:Request,res:Response)=>{
            injectedGoogleLoginController.handleGoogleLogin(req,res)
        })
    }
}