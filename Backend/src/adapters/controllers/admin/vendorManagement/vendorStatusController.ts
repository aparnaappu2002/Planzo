import { Request,Response } from "express";
import { IapproveVendorUseCase } from "../../../../domain/interfaces/useCaseInterfaces/admin/vendorManagement/IapproveVendorUseCase";
import { HttpStatus } from "../../../../domain/enums/httpStatus";
import { IrejectVendorUseCase } from "../../../../domain/interfaces/useCaseInterfaces/admin/vendorManagement/IrejectVendorUseCase";
import { VendorStatus } from "../../../../domain/enums/vendorStatus";
import { Messages } from "../../../../domain/enums/messages";
import { handleErrorResponse,logError } from "../../../../framework/services/errorHandler";
export class VendorStatusController {
    private approveVendorUseCase: IapproveVendorUseCase
    private rejectVendorUseCase: IrejectVendorUseCase
    constructor(approveVendorUseCase: IapproveVendorUseCase,rejectVendorUseCase: IrejectVendorUseCase) {
        this.approveVendorUseCase = approveVendorUseCase
        this.rejectVendorUseCase=rejectVendorUseCase
    }
    async handleApproveVendor(req: Request, res: Response): Promise<void> {
        try {
            const { vendorId, newStatus }: { vendorId: string, newStatus: VendorStatus } = req.body
            if (!vendorId) {
                res.status(HttpStatus.BAD_REQUEST).json({
                    message: 'Vendor ID is required'
                });
                return;
            }
            if (!newStatus) {
                res.status(HttpStatus.BAD_REQUEST).json({
                    message: 'Status is required'
                });
                return;
            }
            
            const updatedVendor = await this.approveVendorUseCase.approveVendor(vendorId, newStatus)
            if (!updatedVendor) {
                res.status(HttpStatus.BAD_REQUEST).json({ message: Messages.VENDOR_APPROVE_ERROR })
                return
            }
            res.status(HttpStatus.OK).json({ message: `Vendor ${newStatus}`, updatedVendor })

        } catch (error) {
            logError('Error while approving the vendor', error);
            handleErrorResponse(req, res, error, Messages.VENDOR_APPROVE_ERROR);
        }
    }
    async handleRejectVendor(req: Request, res: Response): Promise<void> {
        try {
            const { vendorId, newStatus, rejectionReason } = req.body

            if (!vendorId) {
                res.status(HttpStatus.BAD_REQUEST).json({
                    message: 'Vendor ID is required'
                });
                return;
            }
            if (!newStatus) {
                res.status(HttpStatus.BAD_REQUEST).json({
                    message: 'Status is required'
                });
                return;
            }

            await this.rejectVendorUseCase.rejectVendor(vendorId, newStatus, rejectionReason)
            res.status(HttpStatus.OK).json({ message: Messages.VENDOR_REJECTED })
        } catch (error) {
            logError('Error while rejecting vendor', error);
            handleErrorResponse(req, res, error, Messages.VENDOR_REJECT_ERROR);
        }
    }
}