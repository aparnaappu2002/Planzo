import { Request,Response } from "express";
import { IvendorBlockUseCase } from "../../../../domain/interfaces/useCaseInterfaces/admin/vendorManagement/IvendorBlockUseCase";
import { HttpStatus } from "../../../../domain/enums/httpStatus";
import { IredisService } from "../../../../domain/interfaces/serviceInterface/IredisService";
import { IvendorUnblockUseCase } from "../../../../domain/interfaces/useCaseInterfaces/admin/vendorManagement/IvendorUnblockUseCase";
import { ISearchVendorsUseCase } from "../../../../domain/interfaces/useCaseInterfaces/admin/vendorManagement/IsearchVendorUseCase";
import { Messages } from "../../../../domain/enums/messages";
import { handleErrorResponse,logError } from "../../../../framework/services/errorHandler";

export class VendorBlockUnblockController{
    private vendorBlockUseCase:IvendorBlockUseCase
    private vendorUnblockUseCase:IvendorUnblockUseCase
    private searchVendorUseCase:ISearchVendorsUseCase
    private redisService:IredisService

    constructor(vendorUnblockUseCase:IvendorUnblockUseCase,vendorBlockUseCase:IvendorBlockUseCase,searchVendorUseCase:ISearchVendorsUseCase,redisService:IredisService){
        this.vendorBlockUseCase=vendorBlockUseCase
        this.vendorUnblockUseCase=vendorUnblockUseCase
        this.searchVendorUseCase=searchVendorUseCase
        this.redisService=redisService
    }
    async handleVendorBlock(req:Request,res:Response):Promise<void>{
        try{
            const {vendorId} = req.body
            if (!vendorId) {
                res.status(HttpStatus.BAD_REQUEST).json({
                    message: 'Vendor ID is required'
                });
                return;
            }

            const blockVendor = await this.vendorBlockUseCase.blockVendor(vendorId)
            await this.redisService.set(`user:vendor:${vendorId}`,15 * 60,JSON.stringify({status:'block',vendorStatus:'approved'}))
            if(blockVendor) res.status(HttpStatus.OK).json({
                message:Messages.VENDOR_BLOCKED
            })
        }catch(error){
            logError('Error while blocking vendor', error);
            handleErrorResponse(req, res, error, Messages.VENDOR_BLOCK_ERROR);
        }
    }
    async handleVendorUnblock(req:Request,res:Response):Promise<void>{
        try{
            const {vendorId}=req.body
            if (!vendorId) {
                res.status(HttpStatus.BAD_REQUEST).json({
                    message: 'Vendor ID is required'
                });
                return;
            }
            const unblockUser = await this.vendorUnblockUseCase.vendorUnblock(vendorId)
             await this.redisService.set(`user:vendor:${vendorId}`,15*60,JSON.stringify({status:'active',vendorStatus:'approved'}))
            if(unblockUser) res.status(HttpStatus.OK).json({message:Messages.VENDOR_UNBLOCKED})
        }catch(error){
            logError('Error while unblocking vendor', error);
            handleErrorResponse(req, res, error, Messages.VENDOR_UNBLOCK_ERROR);
        }
    }
    async searchVendor(req: Request, res: Response): Promise<void> {
    try {
        const search = req.query.search as string;

        if (!search || search.trim().length === 0) {
            res.status(HttpStatus.BAD_REQUEST).json({
                message: Messages.SEARCH_QUERY_REQUIRED
            });
            return;
        }

        const vendors = await this.searchVendorUseCase.searchVendors(search);

        res.status(HttpStatus.OK).json({
            message: Messages.VENDOR_FETCHED,
            vendors
        });
    } catch (error) {
        logError("Error while searching vendors", error);
        handleErrorResponse(req, res, error, Messages.VENDOR_SEARCH_ERROR);
    }
}
}