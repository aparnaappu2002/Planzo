import { Request,Response } from "express";
import { IfindAllVendorUseCase } from "../../../../domain/interfaces/useCaseInterfaces/admin/vendorManagement/IfindVendorAllUseCase";
import { HttpStatus } from "../../../../domain/enums/httpStatus";
import { IfindPendingVendors } from "../../../../domain/interfaces/useCaseInterfaces/admin/vendorManagement/IfindPendingVendors";
import { Messages } from "../../../../domain/enums/messages";

export class FindVendorController{
    private findAllVendorUseCase :IfindAllVendorUseCase
    private findPendingVendorUseCase: IfindPendingVendors
    constructor(findAllVendorUseCase:IfindAllVendorUseCase,findPendingVendorUseCase: IfindPendingVendors){
        this.findAllVendorUseCase=findAllVendorUseCase
        this.findPendingVendorUseCase=findPendingVendorUseCase
    }

    async findAllVendor(req:Request,res:Response):Promise<void>{
        try{
            const pageNo=parseInt(req.query.pageNo as string,10) || 1
            const {vendors,totalPages}=await this.findAllVendorUseCase.findAllVendor(pageNo)
            console.log(vendors)
            res.status(HttpStatus.OK).json({
                message:Messages.VENDOR_FETCHED,vendors,totalPages
            })
            return
        }catch(error){
            //console.log('error while fetching all vendors', error)
            res.status(HttpStatus.BAD_REQUEST).json({
                message: Messages.VENDOR_FETCH_ERROR,
                error: error instanceof Error ? error.message : Messages.VENDOR_FETCH_ERROR
            })
        }
    }
    async findPendingVendor(req: Request, res: Response) {
        try {
            const pageNo = parseInt(req.query.pageNo as string, 10) || 1;
            const { pendingVendors, totalPages } = await this.findPendingVendorUseCase.findPendingVendors(pageNo)
            res.status(HttpStatus.OK).json({ message: Messages.PENDING_VENDORS_FETCHED, pendingVendors, totalPages })
            return
        } catch (error) {
            //console.log('error while fetching pending vendors', error)
            res.status(HttpStatus.BAD_REQUEST).json({
                message: Messages.PENDING_VENDORS_FETCH_ERROR,
                error: error instanceof Error ? error.message : Messages.PENDING_VENDORS_FETCH_ERROR
            })
        }
    }
}