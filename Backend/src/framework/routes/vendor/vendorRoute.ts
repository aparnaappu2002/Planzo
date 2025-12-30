import { Request,Response,Router } from "express";
import { injectedVendorAuthenticationController,
    injectedVendorLoginLogoutController,
    injectedForgotPasswordVendorController,injectedProfileVendorController,injectedWalletVendorController,
    injectedEventController,injectedTicketVendorController,injectedWorkSampleController,injectedServiceVendorControllerUseCase,injectedBookingVendorController,
    injectedVendorDashboardController,
 } from "../../inject/vendorInject";
import { injectedVerifyTokenAndCheckBlacklistMiddleware,injectedTokenExpiryValidationChecking,injectedVendorStatusCheckingMiddleware } from "../../inject/serviceInject";
import { checkRoleBaseMiddleware } from "../../../adapters/middlewares/checkRoleBaseMiddleware";
import { injectedLoadPreviousChatController,injectedFindChatsOfUserController } from "../../inject/chatInject";
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
            injectedVendorLoginLogoutController.handleLoginVendor(req,res)
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
            injectedTicketVendorController.handleTicketAndUserDetails(req, res)
        })
        this.vendorRoute.post('/logout', injectedVerifyTokenAndCheckBlacklistMiddleware, injectedTokenExpiryValidationChecking, checkRoleBaseMiddleware('vendor'), injectedVendorStatusCheckingMiddleware, (req: Request, res: Response) => {
            injectedVendorLoginLogoutController.handleVendorLogout(req, res)
        })
        this.vendorRoute.post('/createWorkSample', injectedVerifyTokenAndCheckBlacklistMiddleware, injectedTokenExpiryValidationChecking, checkRoleBaseMiddleware('vendor'), injectedVendorStatusCheckingMiddleware, (req: Request, res: Response) => {
            injectedWorkSampleController.handleAddWorkSample(req, res)
        })
        this.vendorRoute.get('/workSamples', injectedVerifyTokenAndCheckBlacklistMiddleware, injectedTokenExpiryValidationChecking, checkRoleBaseMiddleware('vendor'), injectedVendorStatusCheckingMiddleware, (req: Request, res: Response) => {
            injectedWorkSampleController.handleFindWorkSampleOfVendor(req, res)
        })
        this.vendorRoute.get('/categories', injectedVerifyTokenAndCheckBlacklistMiddleware, injectedTokenExpiryValidationChecking, checkRoleBaseMiddleware('vendor'), injectedVendorStatusCheckingMiddleware, (req: Request, res: Response) => {
            injectedServiceVendorControllerUseCase.handleFindCategoryForServiceUseCase(req, res)
        })
        this.vendorRoute.post('/createService', injectedVerifyTokenAndCheckBlacklistMiddleware, injectedTokenExpiryValidationChecking, checkRoleBaseMiddleware('vendor'), injectedVendorStatusCheckingMiddleware, (req: Request, res: Response) => {
            injectedServiceVendorControllerUseCase.handleCreateService(req, res)
        })
        this.vendorRoute.get('/services', injectedVerifyTokenAndCheckBlacklistMiddleware, injectedTokenExpiryValidationChecking, checkRoleBaseMiddleware('vendor'), injectedVendorStatusCheckingMiddleware, (req: Request, res: Response) => {
            injectedServiceVendorControllerUseCase.handleFindService(req, res)
        })
        this.vendorRoute.put('/editService', injectedVerifyTokenAndCheckBlacklistMiddleware, injectedTokenExpiryValidationChecking, checkRoleBaseMiddleware('vendor'), injectedVendorStatusCheckingMiddleware, (req: Request, res: Response) => {
            injectedServiceVendorControllerUseCase.handleEditService(req, res)
        })
        this.vendorRoute.patch('/changeStatusService', injectedVerifyTokenAndCheckBlacklistMiddleware, injectedTokenExpiryValidationChecking, checkRoleBaseMiddleware('vendor'), injectedVendorStatusCheckingMiddleware, (req: Request, res: Response) => {
            injectedServiceVendorControllerUseCase.handleChangeStatusUseCase(req, res)
        })
        this.vendorRoute.get('/showBookings/:vendorId/:pageNo', injectedVerifyTokenAndCheckBlacklistMiddleware, injectedTokenExpiryValidationChecking, checkRoleBaseMiddleware('vendor'), injectedVendorStatusCheckingMiddleware, (req: Request, res: Response) => {
            injectedBookingVendorController.handleShowBookingsInVendor(req, res)
        })
        this.vendorRoute.patch('/approveBooking', injectedVerifyTokenAndCheckBlacklistMiddleware, injectedTokenExpiryValidationChecking, checkRoleBaseMiddleware('vendor'), (req: Request, res: Response) => {
            injectedBookingVendorController.handleApproveBooking(req, res)
        })
        this.vendorRoute.patch('/rejectBooking', injectedVerifyTokenAndCheckBlacklistMiddleware, injectedTokenExpiryValidationChecking, checkRoleBaseMiddleware('vendor'), injectedVendorStatusCheckingMiddleware, (req: Request, res: Response) => {
            injectedBookingVendorController.handleRejectBookingInVendor(req, res)
        })
        this.vendorRoute.patch('/completeBooking', injectedVerifyTokenAndCheckBlacklistMiddleware, injectedTokenExpiryValidationChecking, checkRoleBaseMiddleware('vendor'), injectedVendorStatusCheckingMiddleware, (req: Request, res: Response) => {
            injectedBookingVendorController.handleUpdateBookingComplete(req, res)
        })
        this.vendorRoute.get('/loadPreviousChat', injectedVerifyTokenAndCheckBlacklistMiddleware, injectedTokenExpiryValidationChecking, checkRoleBaseMiddleware('vendor'), injectedVendorStatusCheckingMiddleware, (req: Request, res: Response) => {
            injectedLoadPreviousChatController.handleLoadPreviousMessage(req, res)
        })
        this.vendorRoute.get('/chats', injectedVerifyTokenAndCheckBlacklistMiddleware, injectedTokenExpiryValidationChecking, checkRoleBaseMiddleware('vendor'), injectedVendorStatusCheckingMiddleware, (req: Request, res: Response) => {
            injectedFindChatsOfUserController.handleFindChatOfUser(req, res)
        })
        this.vendorRoute.post('/verifyTicket', injectedVerifyTokenAndCheckBlacklistMiddleware, injectedTokenExpiryValidationChecking, checkRoleBaseMiddleware('vendor'), injectedVendorStatusCheckingMiddleware, (req: Request, res: Response) => {
            injectedTicketVendorController.handleTicketConfirmation(req, res)
        })
        this.vendorRoute.get('/transactions', injectedVerifyTokenAndCheckBlacklistMiddleware, injectedTokenExpiryValidationChecking, checkRoleBaseMiddleware('vendor'), injectedVendorStatusCheckingMiddleware, (req: Request, res: Response) => {
            injectedWalletVendorController.handleFindTransactionsByPaymentStatus(req, res)
        })
        this.vendorRoute.get('/vendorDashboard', injectedVerifyTokenAndCheckBlacklistMiddleware, injectedTokenExpiryValidationChecking, checkRoleBaseMiddleware('vendor'), injectedVendorStatusCheckingMiddleware, (req: Request, res: Response) => {
            injectedVendorDashboardController.handleVendorDashboard(req, res)
        })
        this.vendorRoute.post('/pdfDownload', injectedVerifyTokenAndCheckBlacklistMiddleware, injectedTokenExpiryValidationChecking, checkRoleBaseMiddleware('vendor'), injectedVendorStatusCheckingMiddleware, (req: Request, res: Response) => {
            injectedVendorDashboardController.handlePdfDownloaderVendor(req, res)
        })
    }
}