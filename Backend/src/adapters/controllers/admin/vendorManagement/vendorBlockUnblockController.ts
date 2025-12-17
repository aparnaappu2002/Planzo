import { Request,Response } from "express";
import { IvendorBlockUseCase } from "../../../../domain/interfaces/useCaseInterfaces/admin/vendorManagement/IvendorBlockUseCase";
import { HttpStatus } from "../../../../domain/enums/httpStatus";
import { IredisService } from "../../../../domain/interfaces/serviceInterface/IredisService";
import { IvendorUnblockUseCase } from "../../../../domain/interfaces/useCaseInterfaces/admin/vendorManagement/IvendorUnblockUseCase";
import { ISearchVendorsUseCase } from "../../../../domain/interfaces/useCaseInterfaces/admin/vendorManagement/IsearchVendorUseCase";
import { Messages } from "../../../../domain/enums/messages";

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
            const blockVendor = await this.vendorBlockUseCase.blockVendor(vendorId)
            const changeStatusRedis= await this.redisService.set(`user:vendor:${vendorId}`,15 * 60,JSON.stringify({status:'block',vendorStatus:'approved'}))
            if(blockVendor) res.status(HttpStatus.OK).json({
                message:Messages.VENDOR_BLOCKED
            })
        }catch(error){
            console.log('error while blocking Vendor', error)
            res.status(HttpStatus.BAD_REQUEST).json({
                message: Messages.VENDOR_BLOCK_ERROR,
                error: error instanceof Error ? error.message : Messages.VENDOR_BLOCK_ERROR
            })
        }
    }
    async handleVendorUnblock(req:Request,res:Response):Promise<void>{
        try{
            const {vendorId}=req.body
            const unblockUser = await this.vendorUnblockUseCase.vendorUnblock(vendorId)
            const changeStatusRedis=  await this.redisService.set(`user:vendor:${vendorId}`,15*60,JSON.stringify({status:'active',vendorStatus:'approved'}))
            if(unblockUser) res.status(HttpStatus.OK).json({message:Messages.VENDOR_UNBLOCKED})
        }catch(error){
            console.log(Messages.VENDOR_UNBLOCK_ERROR, error)
            res.status(HttpStatus.BAD_REQUEST).json({
                message: "error while unblocking vendor",
                error: error instanceof Error ? error.message : Messages.VENDOR_UNBLOCK_ERROR
            })
        }
    }
    async searchVendor(req: Request, res: Response): Promise<void> {
    try {
        const search = req.query.search as string;

        if (!search) {
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
        console.log("Error while searching vendors", error);
        res.status(HttpStatus.BAD_REQUEST).json({
            message: Messages.VENDOR_SEARCH_ERROR,
            error: error instanceof Error ? error.message : Messages.VENDOR_SEARCH_ERROR
        });
    }
}
}