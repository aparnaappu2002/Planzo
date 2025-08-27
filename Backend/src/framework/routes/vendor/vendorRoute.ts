import { Request,Response,Router } from "express";
import { injectedVendorAuthenticationController,
    injectedVendorLoginController,
    injectedForgotPasswordVendorController,injectedProfileVendorController,injectedWalletVendorController,
    injectedEventController,injectedTicketAndUserDetailsOfEventController
 } from "../../inject/vendorInject";
import { injectedVerifyTokenAndCheckBlacklistMiddleware,injectedTokenExpiryValidationChecking,injectedVendorStatusCheckingMiddleware } from "../../inject/serviceInject";
import { checkRoleBaseMiddleware } from "../../../adapters/middlewares/checkRoleBaseMiddleware";
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
            injectedVendorAuthenticationController.handleResendOtp(req,res)
        })
        this.vendorRoute.post('/sendMail',(req:Request,res:Response)=>{
            injectedForgotPasswordVendorController.handleSendEmailForgetPasswordVendor(req,res)
        })
        this.vendorRoute.post('/forgotPassword',(req:Request,res:Response)=>{
            injectedForgotPasswordVendorController.handleResetPasswordVendor(req,res)
        })
        this.vendorRoute.patch('/changePassword',(req:Request,res:Response)=>{
            injectedProfileVendorController.handleChangePasswordVendor(req,res)
        })
        this.vendorRoute.patch('/updateDetails',injectedVerifyTokenAndCheckBlacklistMiddleware, injectedTokenExpiryValidationChecking, checkRoleBaseMiddleware('vendor'), injectedVendorStatusCheckingMiddleware,(req:Request,res:Response)=>{
            injectedProfileVendorController.handleUpdateAboutAndPhone(req,res)
        })
        this.vendorRoute.post('/createEvent/:vendorId',injectedVerifyTokenAndCheckBlacklistMiddleware, injectedTokenExpiryValidationChecking, checkRoleBaseMiddleware('vendor'), injectedVendorStatusCheckingMiddleware,(req:Request,res:Response)=>{
            injectedEventController.handleCreateEvent(req,res)
        })
        this.vendorRoute.get('/showEvents/:pageNo/:vendorId',injectedVerifyTokenAndCheckBlacklistMiddleware, injectedTokenExpiryValidationChecking, checkRoleBaseMiddleware('vendor'), injectedVendorStatusCheckingMiddleware,(req:Request,res:Response)=>{
            injectedEventController.handleFindAllEventsVendor(req,res)
        })
        this.vendorRoute.put('/updateEvent',injectedVerifyTokenAndCheckBlacklistMiddleware, injectedTokenExpiryValidationChecking, checkRoleBaseMiddleware('vendor'), injectedVendorStatusCheckingMiddleware,(req:Request,res:Response)=>{
            injectedEventController.handleUpdateEvent(req,res)
        })
        this.vendorRoute.get('/wallet/:userId/:pageNo', injectedVerifyTokenAndCheckBlacklistMiddleware, injectedTokenExpiryValidationChecking, checkRoleBaseMiddleware('vendor'), injectedVendorStatusCheckingMiddleware, (req: Request, res: Response) => {
            injectedWalletVendorController.handleShowWalletDetaills(req, res)
        })
        this.vendorRoute.get('/ticketDetailsWithUser', injectedVerifyTokenAndCheckBlacklistMiddleware, injectedTokenExpiryValidationChecking, checkRoleBaseMiddleware('vendor'), injectedVendorStatusCheckingMiddleware, (req: Request, res: Response) => {
            injectedTicketAndUserDetailsOfEventController.handleTicketAndUserDetails(req, res)
        })
    }
}