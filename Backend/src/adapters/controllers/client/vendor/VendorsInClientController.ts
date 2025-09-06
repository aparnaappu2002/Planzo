import { Request, Response } from "express";
import { IfindVendorForClientUseCase } from "../../../../domain/interfaces/useCaseInterfaces/client/vendor/IfindVendorForClientUseCase";
import { HttpStatus } from "../../../../domain/entities/httpStatus";
import { VendorEntity } from "../../../../domain/entities/vendorEntitty";
import { IfindVendorProfileUseCase } from "../../../../domain/interfaces/useCaseInterfaces/client/vendor/IfindVendorProfileUseCase";


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
            res.status(HttpStatus.OK).json({ message: 'vendors fetched', vendors })
        } catch (error) {
            console.log('error while finding vendors for client carousal', error)
            res.status(HttpStatus.BAD_REQUEST).json({
                message: 'error while fetching vendors for client carousal',
                error: error instanceof Error ? error.message : 'error while fetching vendors for client carousall'
            })
        }
    }
    async handleFindVendorProfile(req: Request, res: Response): Promise<void> {
        try {
            const { vendorId, PageNo} = req.params
            const page = parseInt(PageNo, 10) || 1
            const { services, totalPages, vendorProfile } = await this.findVendorProfileUseCase.findVendorProfile(vendorId, page)
            res.status(HttpStatus.OK).json({
                message: 'vendor profile fetched',
                vendorProfile,
                services,
                totalPages
            })
        } catch (error) {
            console.log('error while finding the vendor profile', error)
            res.status(HttpStatus.BAD_REQUEST).json({
                message: 'error whiel finding the vendor profile',
                error: error instanceof Error ? error.message : 'error while finding the vendor profile'
            })
        }
    }
}

