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
exports.WorkSampleController = void 0;
const httpStatus_1 = require("../../../../domain/enums/httpStatus");
class WorkSampleController {
    constructor(addWorkSamplesUseCase, findWorkSampleVendorUseCase) {
        this.addWorkSamplesUseCase = addWorkSamplesUseCase;
        this.findWorkSampleVendorUseCase = findWorkSampleVendorUseCase;
    }
    handleAddWorkSample(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { workSample } = req.body;
                const newWorkSample = yield this.addWorkSamplesUseCase.createWorkSample(workSample);
                res.status(httpStatus_1.HttpStatus.CREATED).json({ message: "Work Sample created", newWorkSample });
            }
            catch (error) {
                console.log('Error while creating workSample', error);
                res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({
                    message: "Error while creating workSample",
                    error: error instanceof Error ? error.message : 'Error while creating workSample'
                });
            }
        });
    }
    handleFindWorkSampleOfVendor(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { vendorId, pageNo } = req.query;
                if (!vendorId || !pageNo) {
                    res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({ error: "No vendor id found or no pageNo found" });
                    return;
                }
                const page = parseInt(pageNo === null || pageNo === void 0 ? void 0 : pageNo.toString(), 10) || 1;
                const { totalPages, workSamples } = yield this.findWorkSampleVendorUseCase.findWorkSamples(vendorId.toString(), page);
                res.status(httpStatus_1.HttpStatus.OK).json({ message: 'Work samples fetched', workSamples, totalPages });
            }
            catch (error) {
                console.log('error while finding the workSamples of vendor', error);
                res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({
                    message: 'error while finding the worksamples of a vendor',
                    error: error instanceof Error ? error.message : 'error while finding the work samples of vendor'
                });
            }
        });
    }
}
exports.WorkSampleController = WorkSampleController;
