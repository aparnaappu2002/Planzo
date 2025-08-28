import { Request,Response,Router } from "express";
import { clientAuthenticationController,injectedClientLoginController,
    injectedForgotPasswordClientController,injectedProfileClientController,injectedEventClientController,injectedTicketClientController,
    injectedWalletClientController,injectedCategoryClientController
 } from "../../inject/clientInject";
 import { injectedVerifyTokenAndCheckBlacklistMiddleware,injectedTokenExpiryValidationChecking,injectedClientStatusCheckingMiddleware } from "../../inject/serviceInject";
 import { checkRoleBaseMiddleware } from "../../../adapters/middlewares/checkRoleBaseMiddleware";
import { injectedEventController } from "../../inject/vendorInject";

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
            injectedForgotPasswordClientController.handleSendResetEmail(req,res)
        })
        this.clientRoute.post('/forgotPassword',(req:Request,res:Response)=>{
            injectedForgotPasswordClientController.handleResetPassword(req,res)
        })
        this.clientRoute.post('/googleLogin',(req:Request,res:Response)=>{
            injectedClientLoginController.handleGoogleLogin(req,res)
        })
        this.clientRoute.patch('/changePassword',(req:Request,res:Response)=>{
            injectedProfileClientController.handeChangePasswordClient(req,res)
        })
        this.clientRoute.put('/updateProfile',injectedVerifyTokenAndCheckBlacklistMiddleware, injectedTokenExpiryValidationChecking, checkRoleBaseMiddleware('client'), injectedClientStatusCheckingMiddleware,(req:Request,res:Response)=>{
            injectedProfileClientController.handleUpdateProfileClient(req,res)
        })
        this.clientRoute.get('/events/:pageNo',(req:Request,res:Response)=>{
            injectedEventClientController.handleFindAllEventsClient(req,res)
        })
        this.clientRoute.get('/findEvent/:eventId', (req: Request, res: Response) => {
            injectedEventClientController.handleFindEventById(req, res)
        })
        this.clientRoute.post('/createTicket', injectedVerifyTokenAndCheckBlacklistMiddleware, injectedTokenExpiryValidationChecking, checkRoleBaseMiddleware('client'), injectedClientStatusCheckingMiddleware, (req: Request, res: Response) => {
            injectedTicketClientController.handleCreateUseCase(req, res)
        })
        this.clientRoute.post('/confirmTicket', injectedVerifyTokenAndCheckBlacklistMiddleware, injectedTokenExpiryValidationChecking, checkRoleBaseMiddleware('client'), injectedClientStatusCheckingMiddleware, (req: Request, res: Response) => {
            injectedTicketClientController.handleConfirmTicketAndPayment(req, res)
        })
        this.clientRoute.get('/events/search', (req: Request, res: Response) => {
            injectedEventClientController.handleSearchEvents(req, res)
        })
        this.clientRoute.get('/eventsNearToUse/:latitude/:longitude/:pageNo/:range', (req: Request, res: Response) => {
            injectedEventClientController.handleEventsNearToUse(req, res)
        })
        this.clientRoute.get('/bookings/:userId/:pageNo', injectedVerifyTokenAndCheckBlacklistMiddleware, injectedTokenExpiryValidationChecking, checkRoleBaseMiddleware('client'), injectedClientStatusCheckingMiddleware, (req: Request, res: Response) => {
            injectedTicketClientController.handleFetchTicketAndEventDetails(req, res)
        })
        this.clientRoute.patch('/ticketCancel', injectedVerifyTokenAndCheckBlacklistMiddleware, injectedTokenExpiryValidationChecking, checkRoleBaseMiddleware('client'), injectedClientStatusCheckingMiddleware, (req: Request, res: Response) => {
            injectedTicketClientController.handleTicketCancel(req, res)
        })
        this.clientRoute.get('/wallet/:userId/:pageNo', injectedVerifyTokenAndCheckBlacklistMiddleware, injectedTokenExpiryValidationChecking, checkRoleBaseMiddleware('client'), injectedClientStatusCheckingMiddleware, (req: Request, res: Response) => {
            injectedWalletClientController.handleFindClientWallet(req, res)
        })
        this.clientRoute.get('/events/:category/:pageNo/:sortBy',  (req: Request, res: Response) => {
            injectedEventClientController.handleFindEventsBasedOnCategory(req, res)
        })
        this.clientRoute.post('/events/searchNearby', (req: Request, res: Response) => {
            injectedEventClientController.handleEventsNearLocation(req, res)
        })
    }
}