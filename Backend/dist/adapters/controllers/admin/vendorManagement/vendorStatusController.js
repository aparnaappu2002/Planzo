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
exports.VendorStatusController = void 0;
const httpStatus_1 = require("../../../../domain/enums/httpStatus");
const messages_1 = require("../../../../domain/enums/messages");
class VendorStatusController {
    constructor(approveVendorUseCase, rejectVendorUseCase) {
        this.approveVendorUseCase = approveVendorUseCase;
        this.rejectVendorUseCase = rejectVendorUseCase;
    }
    handleApproveVendor(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { vendorId, newStatus } = req.body;
                const updatedVendor = yield this.approveVendorUseCase.approveVendor(vendorId, newStatus);
                if (!updatedVendor) {
                    res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({ message: messages_1.Messages.VENDOR_APPROVE_ERROR });
                    return;
                }
                res.status(httpStatus_1.HttpStatus.OK).json({ message: `Vendor ${newStatus}`, updatedVendor });
            }
            catch (error) {
                console.log('error while  approving the vendor controller', error);
                res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({
                    message: messages_1.Messages.VENDOR_APPROVE_ERROR,
                    error: error instanceof Error ? error.message : messages_1.Messages.VENDOR_APPROVE_ERROR
                });
            }
        });
    }
    handleRejectVendor(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { vendorId, newStatus, rejectionReason } = req.body;
                yield this.rejectVendorUseCase.rejectVendor(vendorId, newStatus, rejectionReason);
                res.status(httpStatus_1.HttpStatus.OK).json({ message: messages_1.Messages.VENDOR_REJECTED });
            }
            catch (error) {
                console.log('error while rejecting vendor', error);
                res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({
                    message: messages_1.Messages.VENDOR_REJECT_ERROR,
                    error: error instanceof Error ? error.message : messages_1.Messages.VENDOR_REJECT_ERROR
                });
            }
        });
    }
}
exports.VendorStatusController = VendorStatusController;
