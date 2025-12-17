import { Request, Response } from "express";
import { IWorkSampleCreationUseCase } from "../../../../domain/interfaces/useCaseInterfaces/vendor/workSamples/IworkSamplesCreationUseCase";
import { HttpStatus } from "../../../../domain/enums/httpStatus";
import { IfindWorkSamplesOfAVendorUseCase } from "../../../../domain/interfaces/useCaseInterfaces/vendor/workSamples/IfindWorkSampleofVendorUseCase";

export class WorkSampleController {
    private addWorkSamplesUseCase: IWorkSampleCreationUseCase
    private findWorkSampleVendorUseCase:IfindWorkSamplesOfAVendorUseCase
    constructor(addWorkSamplesUseCase: IWorkSampleCreationUseCase,findWorkSampleVendorUseCase:IfindWorkSamplesOfAVendorUseCase) {
        this.addWorkSamplesUseCase = addWorkSamplesUseCase
        this.findWorkSampleVendorUseCase=findWorkSampleVendorUseCase
    }
    async handleAddWorkSample(req: Request, res: Response): Promise<void> {
        try {
            const { workSample } = req.body
            const newWorkSample = await this.addWorkSamplesUseCase.createWorkSample(workSample)
            res.status(HttpStatus.CREATED).json({ message: "Work Sample created", newWorkSample })
        } catch (error) {
            console.log('Error while creating workSample', error)
            res.status(HttpStatus.BAD_REQUEST).json({
                message: "Error while creating workSample",
                error: error instanceof Error ? error.message : 'Error while creating workSample'
            })
        }
    }
    async handleFindWorkSampleOfVendor(req: Request, res: Response): Promise<void> {
        try {
            const { vendorId, pageNo } = req.query
            if (!vendorId || !pageNo) {
                res.status(HttpStatus.BAD_REQUEST).json({ error: "No vendor id found or no pageNo found" })
                return
            }
            const page = parseInt(pageNo?.toString(), 10) || 1
            const { totalPages, workSamples } = await this.findWorkSampleVendorUseCase.findWorkSamples(vendorId.toString(), page)
            res.status(HttpStatus.OK).json({ message: 'Work samples fetched', workSamples, totalPages })
        } catch (error) {
            console.log('error while finding the workSamples of vendor', error)
            res.status(HttpStatus.BAD_REQUEST).json({
                message: 'error while finding the worksamples of a vendor',
                error: error instanceof Error ? error.message : 'error while finding the work samples of vendor'
            })
        }
    }
}