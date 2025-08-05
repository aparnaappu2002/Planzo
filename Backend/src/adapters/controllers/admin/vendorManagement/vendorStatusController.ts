import { Request,Response } from "express";
import { IapproveVendorUseCase } from "../../../../domain/interfaces/useCaseInterfaces/admin/vendorManagement/IapproveVendorUseCase";
import { HttpStatus } from "../../../../domain/entities/httpStatus";
import { IrejectVendorUseCase } from "../../../../domain/interfaces/useCaseInterfaces/admin/vendorManagement/IrejectVendorUseCase";

enum VendorStatus {
    Approved = 'approved',
    Rejected = 'rejected'
}
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
            const updatedVendor = await this.approveVendorUseCase.approveVendor(vendorId, newStatus)
            if (!updatedVendor) {
                res.status(HttpStatus.BAD_REQUEST).json({ message: 'error while  approving the vendor' })
                return
            }
            res.status(HttpStatus.OK).json({ message: `Vendor ${newStatus}`, updatedVendor })

        } catch (error) {
            console.log('error while  approving the vendor controller', error)
            res.status(HttpStatus.BAD_REQUEST).json({
                message: "error while approving the vendor",
                error: error instanceof Error ? error.message : 'error while approving the vendor'
            })
        }
    }
    async handleRejectVendor(req: Request, res: Response): Promise<void> {
        try {
            const { vendorId, newStatus, rejectionReason } = req.body
            await this.rejectVendorUseCase.rejectVendor(vendorId, newStatus, rejectionReason)
            res.status(HttpStatus.OK).json({ message: "Vendor rejected" })
        } catch (error) {
            console.log('error while rejecting vendor', error)
            res.status(HttpStatus.BAD_REQUEST).json({
                message: "error while rejecting venodr",
                error: error instanceof Error ? error.message : 'error while rejecting vendor'
            })
        }
    }
}