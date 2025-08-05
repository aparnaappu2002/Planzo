import { Request,Response, Router } from "express";
import { injectedAdminLoginController,injectedUserManagementController,injectedBlockUnblockController,injectedVendorStatusController,
    injectedFindVendorsController
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
    }
}