import { Request,Response, Router } from "express";
import { injectedAdminLoginController,injectedUserManagementController,injectedBlockUnblockController,injectedVendorStatusController,injectedAdminWalletController,
    injectedFindVendorsController,injectedCategoryController,injectedFindEventsInAdminSideController,injectedDashboardAdminController
 } from "../../inject/adminInject";
import { injectedVerifyTokenAndCheckBlacklistMiddleware,injectedTokenExpiryValidationChecking,checkAdminMiddleWare } from "../../inject/serviceInject";

export class AdminRoute{
    public adminRoute:Router
    constructor(){
        this.adminRoute=Router()
        this.setRoute()
    }

    private setRoute(){
        this.adminRoute.post('/login',(req:Request,res:Response)=>{
            injectedAdminLoginController.handleAdminLogin(req,res)
        })
        this.adminRoute.patch('/blockClient',injectedVerifyTokenAndCheckBlacklistMiddleware,injectedTokenExpiryValidationChecking,checkAdminMiddleWare,(req:Request,res:Response)=>{
            injectedUserManagementController.handleClientBlock(req,res)
        })
        this.adminRoute.patch('/unblockClient',injectedVerifyTokenAndCheckBlacklistMiddleware,injectedTokenExpiryValidationChecking,checkAdminMiddleWare,(req:Request,res:Response)=>{
            injectedUserManagementController.handleClientUnblock(req,res)
        })
        this.adminRoute.get('/clients',injectedVerifyTokenAndCheckBlacklistMiddleware,injectedTokenExpiryValidationChecking,checkAdminMiddleWare,(req:Request,res:Response)=>{
            injectedUserManagementController.findAllClient(req,res)
        })
        this.adminRoute.get('/vendors',injectedVerifyTokenAndCheckBlacklistMiddleware,injectedTokenExpiryValidationChecking,checkAdminMiddleWare,(req:Request,res:Response)=>{
            injectedFindVendorsController.findAllVendor(req,res)
        })
        this.adminRoute.patch('/blockVendor',injectedVerifyTokenAndCheckBlacklistMiddleware,injectedTokenExpiryValidationChecking,checkAdminMiddleWare,(req:Request,res:Response)=>{
            injectedBlockUnblockController.handleVendorBlock(req,res)
        })
        this.adminRoute.patch('/unblockVendor',injectedVerifyTokenAndCheckBlacklistMiddleware,injectedTokenExpiryValidationChecking,checkAdminMiddleWare,(req:Request,res:Response)=>{
            injectedBlockUnblockController.handleVendorUnblock(req,res)
        })
        this.adminRoute.get('/pendingVendors',injectedVerifyTokenAndCheckBlacklistMiddleware,injectedTokenExpiryValidationChecking,checkAdminMiddleWare,(req:Request,res:Response)=>{
            injectedFindVendorsController.findPendingVendor(req,res)
        })
        this.adminRoute.patch('/rejectVendor',injectedVerifyTokenAndCheckBlacklistMiddleware,injectedTokenExpiryValidationChecking,checkAdminMiddleWare,(req:Request,res:Response)=>{
            injectedVendorStatusController.handleRejectVendor(req,res)
        })
        this.adminRoute.patch('/approveVendor',injectedVerifyTokenAndCheckBlacklistMiddleware,injectedTokenExpiryValidationChecking,checkAdminMiddleWare,(req:Request,res:Response)=>{
            injectedVendorStatusController.handleApproveVendor(req,res)
        })
        this.adminRoute.get('/search',injectedVerifyTokenAndCheckBlacklistMiddleware,injectedTokenExpiryValidationChecking,checkAdminMiddleWare,(req:Request,res:Response)=>{
            injectedUserManagementController.searchClient(req,res)
        })
        this.adminRoute.get('/searchVendor',injectedVerifyTokenAndCheckBlacklistMiddleware,injectedTokenExpiryValidationChecking,checkAdminMiddleWare,(req:Request,res:Response)=>{
            injectedBlockUnblockController.searchVendor(req,res)
        })
        this.adminRoute.get('/wallet/:userId/:pageNo', injectedVerifyTokenAndCheckBlacklistMiddleware, injectedTokenExpiryValidationChecking, checkAdminMiddleWare, (req: Request, res: Response) => {
            injectedAdminWalletController.handleFindWalletDetails(req, res)
        })
        this.adminRoute.get('/categories', injectedVerifyTokenAndCheckBlacklistMiddleware, injectedTokenExpiryValidationChecking, checkAdminMiddleWare, (req: Request, res: Response) => {
            injectedCategoryController.handleFindCategory(req, res)
        })
        this.adminRoute.post('/createCategory', injectedVerifyTokenAndCheckBlacklistMiddleware, injectedTokenExpiryValidationChecking, checkAdminMiddleWare, (req: Request, res: Response) => {
            injectedCategoryController.handleCreatecategory(req, res)
        })
        this.adminRoute.patch('/changeStatusCategory', injectedVerifyTokenAndCheckBlacklistMiddleware, injectedTokenExpiryValidationChecking, checkAdminMiddleWare, (req: Request, res: Response) => {
            injectedCategoryController.handleChangeCategoryStatus(req, res)
        })
        this.adminRoute.patch('/updateCategory', injectedVerifyTokenAndCheckBlacklistMiddleware, injectedTokenExpiryValidationChecking, checkAdminMiddleWare, (req: Request, res: Response) => {
            injectedCategoryController.handleUpdateCategory(req, res)
        })
        this.adminRoute.get('/eventDetails', injectedVerifyTokenAndCheckBlacklistMiddleware, injectedTokenExpiryValidationChecking, checkAdminMiddleWare, (req: Request, res: Response) => {
            injectedFindEventsInAdminSideController.handleListingEventsInAdminSide(req, res)
        })
        this.adminRoute.get('/transactions', injectedVerifyTokenAndCheckBlacklistMiddleware, injectedTokenExpiryValidationChecking, checkAdminMiddleWare, (req: Request, res: Response) => {
            injectedAdminWalletController.handleFindWalletByPaymentStatus(req, res)
        })
        this.adminRoute.get('/dashboard', injectedVerifyTokenAndCheckBlacklistMiddleware, injectedTokenExpiryValidationChecking, checkAdminMiddleWare, (req: Request, res: Response) => {
            injectedDashboardAdminController.handleAdminDashboardata(req, res)
        })
    }
}