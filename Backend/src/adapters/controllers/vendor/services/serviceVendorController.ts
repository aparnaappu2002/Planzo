import { Request, Response } from "express";
import { IcreateServiceUseCase } from "../../../../domain/interfaces/useCaseInterfaces/vendor/service/IcreateServiceUseCase";
import { ServiceEntity } from "../../../../domain/entities/serviceEntity";
import { HttpStatus } from "../../../../domain/enums/httpStatus";
import { IeditServiceUseCase } from "../../../../domain/interfaces/useCaseInterfaces/vendor/service/IeditServiceUseCase";
import { IchangeStatusServiceUseCase } from "../../../../domain/interfaces/useCaseInterfaces/vendor/service/IchangeStatusServiceUseCase";
import { IfindServiceUseCaseInterface } from "../../../../domain/interfaces/useCaseInterfaces/vendor/service/IfindServiceUseCaseInterface";
import { IfindCategoryForServiceUseCase } from "../../../../domain/interfaces/useCaseInterfaces/vendor/service/IfindCategoryUseCaseInterface";

interface Params {
    service: ServiceEntity,
    serviceId: string
}
export class ServiceVendorController {
    private findCategoryForServiceUseCase:IfindCategoryForServiceUseCase
    private createServiceUseCase: IcreateServiceUseCase
    private editServiceUseCase:IeditServiceUseCase
    private changeStatusServiceUseCase:IchangeStatusServiceUseCase
    private findServiceUseCase:IfindServiceUseCaseInterface
    constructor(findCategoryForServiceUseCase:IfindCategoryForServiceUseCase,createServiceUseCase: IcreateServiceUseCase,editServiceUseCase:IeditServiceUseCase,
        changeStatusServiceUseCase:IchangeStatusServiceUseCase,findServiceUseCase:IfindServiceUseCaseInterface) {
        this.createServiceUseCase = createServiceUseCase
        this.editServiceUseCase=editServiceUseCase
        this.changeStatusServiceUseCase=changeStatusServiceUseCase
        this.findServiceUseCase=findServiceUseCase
        this.findCategoryForServiceUseCase=findCategoryForServiceUseCase
    }
    async handleFindCategoryForServiceUseCase(req: Request, res: Response): Promise<void> {
        try {
            const categories = await this.findCategoryForServiceUseCase.findCategoryForService()
            if (!categories) {
                res.status(HttpStatus.BAD_REQUEST).json({ message: 'error while fetching categories for service' })
                return
            }
            res.status(HttpStatus.OK).json({ message: 'categories fetched', categories })
        } catch (error) {
            console.log('error while fetching categories for service', error)
            res.status(HttpStatus.BAD_REQUEST).json({
                message: "error while fetching categories for service",
                error: error instanceof Error ? error.message : 'error while fetching categories for service'
            })
        }
        
    }
    async handleCreateService(req: Request, res: Response): Promise<void> {
        try {
            const { service } = req.body
            const createdService = await this.createServiceUseCase.createService(service)
            if (!createdService) {
                res.status(HttpStatus.BAD_REQUEST).json({ message: 'error while creating service' })
                return
            }
            res.status(HttpStatus.CREATED).json({ message: "service created", service: createdService })
        } catch (error) {
            console.log('error while creating service', error)
            res.status(HttpStatus.BAD_REQUEST).json({
                message: 'error while creating service',
                error: error instanceof Error ? error.message : 'error while creating service'
            })
        }
    }
    async handleEditService(req: Request, res: Response): Promise<void> {
        try {
            const { service, serviceId }: Params = req.body
            const updatedService = await this.editServiceUseCase.editService(service, serviceId)
            res.status(HttpStatus.OK).json({ message: "Service Updated", updatedService })
        } catch (error) {
            console.log('error while udpating service', error)
            res.status(HttpStatus.BAD_REQUEST).json({
                message: 'error while udpating service',
                error: error instanceof Error ? error.message : 'error while udpating service'
            })
        }
    }
    async handleChangeStatusUseCase(req: Request, res: Response): Promise<void> {
        try {
            const { serviceId } = req.body
            const changedService = await this.changeStatusServiceUseCase.changeStatus(serviceId)
            if (!changedService) {
                res.status(HttpStatus.BAD_REQUEST).json({ message: "error while changing the status of the user" })
                return
            }
            res.status(HttpStatus.OK).json({ message: "Status Changes" })
        } catch (error) {
            console.log('error while changing status of service', error)
            res.status(HttpStatus.BAD_REQUEST).json({
                message: "error while changing status of service",
                error: error instanceof Error ? error.message : 'error while changing status of service'
            })
        }
        
    }
    async handleFindService(req: Request, res: Response): Promise<void> {
        try {
            const vendorId = req.query.vendorId as string;
            const pageNo = req.query.pageNo as string;
            const page = parseInt(pageNo, 10) || 1;
            const { Services, totalPages } = await this.findServiceUseCase.findService(vendorId, page)
            res.status(HttpStatus.OK).json({ message: "Service fetched", Services, totalPages })
        } catch (error) {
            console.log('error while fetching service', error)
            res.status(HttpStatus.BAD_REQUEST).json({
                message: 'error while fetching service',
                error: error instanceof Error ? error.message : 'error while fetching service'
            })
        }
    }
}