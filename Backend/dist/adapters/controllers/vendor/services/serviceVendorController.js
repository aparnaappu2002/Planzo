"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceVendorController = void 0;
const httpStatus_1 = require("../../../../domain/enums/httpStatus");
class ServiceVendorController {
    constructor(findCategoryForServiceUseCase, createServiceUseCase, editServiceUseCase, changeStatusServiceUseCase, findServiceUseCase) {
        this.createServiceUseCase = createServiceUseCase;
        this.editServiceUseCase = editServiceUseCase;
        this.changeStatusServiceUseCase = changeStatusServiceUseCase;
        this.findServiceUseCase = findServiceUseCase;
        this.findCategoryForServiceUseCase = findCategoryForServiceUseCase;
    }
    handleFindCategoryForServiceUseCase(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const categories = yield this.findCategoryForServiceUseCase.findCategoryForService();
                if (!categories) {
                    res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({ message: 'error while fetching categories for service' });
                    return;
                }
                res.status(httpStatus_1.HttpStatus.OK).json({ message: 'categories fetched', categories });
            }
            catch (error) {
                console.log('error while fetching categories for service', error);
                res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({
                    message: "error while fetching categories for service",
                    error: error instanceof Error ? error.message : 'error while fetching categories for service'
                });
            }
        });
    }
    handleCreateService(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { service } = req.body;
                const createdService = yield this.createServiceUseCase.createService(service);
                if (!createdService) {
                    res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({ message: 'error while creating service' });
                    return;
                }
                res.status(httpStatus_1.HttpStatus.CREATED).json({ message: "service created", service: createdService });
            }
            catch (error) {
                console.log('error while creating service', error);
                res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({
                    message: 'error while creating service',
                    error: error instanceof Error ? error.message : 'error while creating service'
                });
            }
        });
    }
    handleEditService(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { service, serviceId } = req.body;
                const updatedService = yield this.editServiceUseCase.editService(service, serviceId);
                res.status(httpStatus_1.HttpStatus.OK).json({ message: "Service Updated", updatedService });
            }
            catch (error) {
                console.log('error while udpating service', error);
                res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({
                    message: 'error while udpating service',
                    error: error instanceof Error ? error.message : 'error while udpating service'
                });
            }
        });
    }
    handleChangeStatusUseCase(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { serviceId } = req.body;
                const changedService = yield this.changeStatusServiceUseCase.changeStatus(serviceId);
                if (!changedService) {
                    res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({ message: "error while changing the status of the user" });
                    return;
                }
                res.status(httpStatus_1.HttpStatus.OK).json({ message: "Status Changes" });
            }
            catch (error) {
                console.log('error while changing status of service', error);
                res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({
                    message: "error while changing status of service",
                    error: error instanceof Error ? error.message : 'error while changing status of service'
                });
            }
        });
    }
    handleFindService(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const vendorId = req.query.vendorId;
                const pageNo = req.query.pageNo;
                const page = parseInt(pageNo, 10) || 1;
                const { Services, totalPages } = yield this.findServiceUseCase.findService(vendorId, page);
                res.status(httpStatus_1.HttpStatus.OK).json({ message: "Service fetched", Services, totalPages });
            }
            catch (error) {
                console.log('error while fetching service', error);
                res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({
                    message: 'error while fetching service',
                    error: error instanceof Error ? error.message : 'error while fetching service'
                });
            }
        });
    }
}
exports.ServiceVendorController = ServiceVendorController;
