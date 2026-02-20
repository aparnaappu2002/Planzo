import { Request, Response } from "express";
import { IWorkSampleCreationUseCase } from "../../../../domain/interfaces/useCaseInterfaces/vendor/workSamples/IworkSamplesCreationUseCase";
import { HttpStatus } from "../../../../domain/enums/httpStatus";
import { IfindWorkSamplesOfAVendorUseCase } from "../../../../domain/interfaces/useCaseInterfaces/vendor/workSamples/IfindWorkSampleofVendorUseCase";
import { handleErrorResponse,logError } from "../../../../framework/services/errorHandler";
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
            if (!workSample) {
                res.status(HttpStatus.BAD_REQUEST).json({
                    message: 'Work sample data is required'
                });
                return;
            }
            const newWorkSample = await this.addWorkSamplesUseCase.createWorkSample(workSample)
            res.status(HttpStatus.CREATED).json({ message: "Work Sample created", newWorkSample })
        } catch (error) {
            logError('Error while creating work sample', error);
            handleErrorResponse(req, res, error, 'Failed to create work sample');
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
            logError('Error while finding work samples of vendor', error);
            handleErrorResponse(req, res, error, 'Failed to fetch work samples');
        }
    }
}