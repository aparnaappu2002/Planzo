import { Request, Response } from "express";
import { IfindVendorForClientUseCase } from "../../../../domain/interfaces/useCaseInterfaces/client/vendor/IfindVendorForClientUseCase";
import { HttpStatus } from "../../../../domain/enums/httpStatus";
import { VendorEntity } from "../../../../domain/entities/vendorEntitty";
import { IfindVendorProfileUseCase } from "../../../../domain/interfaces/useCaseInterfaces/client/vendor/IfindVendorProfileUseCase";
import { Messages } from "../../../../domain/enums/messages";


export class VendorForClientController {
    private findVendorForClientUseCase: IfindVendorForClientUseCase
    private findVendorProfileUseCase:IfindVendorProfileUseCase
    constructor(findVendorForClientUseCase: IfindVendorForClientUseCase,findVendorProfileUseCase:IfindVendorProfileUseCase) {
        this.findVendorForClientUseCase=findVendorForClientUseCase
        this.findVendorProfileUseCase=findVendorProfileUseCase
    }
    async handleFindVendorForClient(req: Request, res: Response): Promise<void> {
        try {
            const vendors: VendorEntity[] = await this.findVendorForClientUseCase.findVendorForClientUseCase()
            res.status(HttpStatus.OK).json({ message: Messages.VENDOR_FETCHED, vendors })
        } catch (error) {
            console.log('error while finding vendors for client carousal', error)
            res.status(HttpStatus.BAD_REQUEST).json({
                message: Messages.VENDORS_FETCH_ERROR,
                error: error instanceof Error ? error.message : Messages.VENDORS_FETCH_ERROR
            })
        }
    }
    async handleFindVendorProfile(req: Request, res: Response): Promise<void> {
        try {
            const { vendorId, PageNo} = req.params
            const page = parseInt(PageNo, 10) || 1
            const { services, totalPages, vendorProfile } = await this.findVendorProfileUseCase.findVendorProfile(vendorId, page)
            res.status(HttpStatus.OK).json({
                message: Messages.PROFILE_FETCHED,
                vendorProfile,
                services,
                totalPages
            })
        } catch (error) {
            console.log('error while finding the vendor profile', error)
            res.status(HttpStatus.BAD_REQUEST).json({
                message: Messages.PROFILE_FETCH_ERROR,
                error: error instanceof Error ? error.message : Messages.PROFILE_FETCH_ERROR
            })
        }
    }
}

