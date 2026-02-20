import { Request, Response } from "express";
import { IcreateServiceUseCase } from "../../../../domain/interfaces/useCaseInterfaces/vendor/service/IcreateServiceUseCase";
import { ServiceEntity } from "../../../../domain/entities/serviceEntity";
import { HttpStatus } from "../../../../domain/enums/httpStatus";
import { IeditServiceUseCase } from "../../../../domain/interfaces/useCaseInterfaces/vendor/service/IeditServiceUseCase";
import { IchangeStatusServiceUseCase } from "../../../../domain/interfaces/useCaseInterfaces/vendor/service/IchangeStatusServiceUseCase";
import { IfindServiceUseCaseInterface } from "../../../../domain/interfaces/useCaseInterfaces/vendor/service/IfindServiceUseCaseInterface";
import { IfindCategoryForServiceUseCase } from "../../../../domain/interfaces/useCaseInterfaces/vendor/service/IfindCategoryUseCaseInterface";
import { IsearchServiceVendorUseCase } from "../../../../domain/interfaces/useCaseInterfaces/vendor/service/IsearchServiceVendorUseCase";
import { Params } from "../../../../domain/interfaces/controllerInterfaces/Iparams";
import { handleErrorResponse,logError } from "../../../../framework/services/errorHandler";


export class ServiceVendorController {
    private findCategoryForServiceUseCase:IfindCategoryForServiceUseCase
    private createServiceUseCase: IcreateServiceUseCase
    private editServiceUseCase:IeditServiceUseCase
    private changeStatusServiceUseCase:IchangeStatusServiceUseCase
    private findServiceUseCase:IfindServiceUseCaseInterface
    private searchServiceVendorUseCase:IsearchServiceVendorUseCase
    constructor(findCategoryForServiceUseCase:IfindCategoryForServiceUseCase,createServiceUseCase: IcreateServiceUseCase,editServiceUseCase:IeditServiceUseCase,
        changeStatusServiceUseCase:IchangeStatusServiceUseCase,findServiceUseCase:IfindServiceUseCaseInterface,searchServiceVendorUseCase:IsearchServiceVendorUseCase) {
        this.createServiceUseCase = createServiceUseCase
        this.editServiceUseCase=editServiceUseCase
        this.changeStatusServiceUseCase=changeStatusServiceUseCase
        this.findServiceUseCase=findServiceUseCase
        this.findCategoryForServiceUseCase=findCategoryForServiceUseCase
        this.searchServiceVendorUseCase=searchServiceVendorUseCase
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
            logError('Error while fetching categories for service', error);
            handleErrorResponse(req, res, error, 'Failed to fetch categories for service');
        }
        
    }
    async handleCreateService(req: Request, res: Response): Promise<void> {
        try {
            const { service } = req.body
            if (!service) {
                res.status(HttpStatus.BAD_REQUEST).json({
                    message: 'Service data is required'
                });
                return;
            }
            const createdService = await this.createServiceUseCase.createService(service)
            if (!createdService) {
                res.status(HttpStatus.BAD_REQUEST).json({ message: 'error while creating service' })
                return
            }
            res.status(HttpStatus.CREATED).json({ message: "service created", service: createdService })
        } catch (error) {
            logError('Error while creating service', error);
            handleErrorResponse(req, res, error, 'Failed to create service');
        }
    }
    async handleEditService(req: Request, res: Response): Promise<void> {
        try {
            const { service, serviceId }: Params = req.body
            if (!serviceId) {
                res.status(HttpStatus.BAD_REQUEST).json({
                    message: 'Service ID is required'
                });
                return;
            }
            if (!service) {
                res.status(HttpStatus.BAD_REQUEST).json({
                    message: 'Service data is required'
                });
                return;
            }
            const updatedService = await this.editServiceUseCase.editService(service, serviceId)
            res.status(HttpStatus.OK).json({ message: "Service Updated", updatedService })
        } catch (error) {
            logError('Error while updating service', error);
            handleErrorResponse(req, res, error, 'Failed to update service');
        }
    }
    async handleChangeStatusUseCase(req: Request, res: Response): Promise<void> {
        try {
            const { serviceId } = req.body
            if (!serviceId) {
                res.status(HttpStatus.BAD_REQUEST).json({
                    message: 'Service ID is required'
                });
                return;
            }
            const changedService = await this.changeStatusServiceUseCase.changeStatus(serviceId)
            if (!changedService) {
                res.status(HttpStatus.BAD_REQUEST).json({ message: "error while changing the status of the user" })
                return
            }
            res.status(HttpStatus.OK).json({ message: "Status Changes" })
        } catch (error) {
            logError('Error while changing status of service', error);
            handleErrorResponse(req, res, error, 'Failed to change service status');
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
            logError('Error while fetching service', error);
            handleErrorResponse(req, res, error, 'Failed to fetch services');
        }
    }
    async handleSearchService(req: Request, res: Response): Promise<void> {
        try {
            const vendorId = req.query.vendorId as string;
            const searchTerm = req.query.searchTerm as string;
            const pageNo = req.query.pageNo as string;
            const page = parseInt(pageNo, 10) || 1;
            if (!vendorId) {
                res.status(HttpStatus.BAD_REQUEST).json({
                    message: 'Vendor ID is required'
                });
                return;
            }
            if (!searchTerm || !searchTerm.trim()) {
                res.status(HttpStatus.BAD_REQUEST).json({ 
                    message: 'Search term is required' 
                });
                return;
            }
            
            const { Services, totalPages } = await this.searchServiceVendorUseCase.searchServiceVendor(
                vendorId,
                searchTerm,
                page
            );
            
            res.status(HttpStatus.OK).json({ 
                message: "Services searched successfully", 
                Services, 
                totalPages 
            });
        } catch (error) {
            logError('Error while searching service', error);
            handleErrorResponse(req, res, error, 'Failed to search services');
        }
    }

}