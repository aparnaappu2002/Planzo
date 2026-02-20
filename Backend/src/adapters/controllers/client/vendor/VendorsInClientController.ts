import { Request, Response } from "express";
import { IfindVendorForClientUseCase } from "../../../../domain/interfaces/useCaseInterfaces/client/vendor/IfindVendorForClientUseCase";
import { HttpStatus } from "../../../../domain/enums/httpStatus";
import { VendorEntity } from "../../../../domain/entities/vendorEntitty";
import { IfindVendorProfileUseCase } from "../../../../domain/interfaces/useCaseInterfaces/client/vendor/IfindVendorProfileUseCase";
import { Messages } from "../../../../domain/enums/messages";
import { handleErrorResponse,logInfo,logError } from "../../../../framework/services/errorHandler";
import { FindVendorDTO } from "../../../../domain/dto/vendor/findVendorDTO";


export class VendorForClientController {
    private findVendorForClientUseCase: IfindVendorForClientUseCase
    private findVendorProfileUseCase:IfindVendorProfileUseCase
    constructor(findVendorForClientUseCase: IfindVendorForClientUseCase,findVendorProfileUseCase:IfindVendorProfileUseCase) {
        this.findVendorForClientUseCase=findVendorForClientUseCase
        this.findVendorProfileUseCase=findVendorProfileUseCase
    }
    async handleFindVendorForClient(req: Request, res: Response): Promise<void> {
        try {
            const vendors: FindVendorDTO[] = await this.findVendorForClientUseCase.findVendorForClientUseCase()
            logInfo(`Vendors fetched successfully for client carousel - count: ${vendors.length}`);

            res.status(HttpStatus.OK).json({ message: Messages.VENDOR_FETCHED, vendors })
        } catch (error) {
            logError('Error while finding vendors for client carousel', error);
            handleErrorResponse(req, res, error, Messages.VENDORS_FETCH_ERROR);
        }
    }
    async handleFindVendorProfile(req: Request, res: Response): Promise<void> {
        try {
            const { vendorId, PageNo} = req.params
            const page = parseInt(PageNo, 10) || 1
            const { services, totalPages, vendorProfile } = await this.findVendorProfileUseCase.findVendorProfile(vendorId, page)
            logInfo(`Vendor profile fetched successfully - vendorId: ${vendorId}, services count: ${services.length}, total pages: ${totalPages}`);

            res.status(HttpStatus.OK).json({
                message: Messages.PROFILE_FETCHED,
                vendorProfile,
                services,
                totalPages
            })
        } catch (error) {
            logError('Error while finding the vendor profile', error);
            handleErrorResponse(req, res, error, Messages.PROFILE_FETCH_ERROR);
        }
    }
}

