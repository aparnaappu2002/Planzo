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
exports.FindVendorController = void 0;
const httpStatus_1 = require("../../../../domain/enums/httpStatus");
const messages_1 = require("../../../../domain/enums/messages");
class FindVendorController {
    constructor(findAllVendorUseCase, findPendingVendorUseCase) {
        this.findAllVendorUseCase = findAllVendorUseCase;
        this.findPendingVendorUseCase = findPendingVendorUseCase;
    }
    findAllVendor(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const pageNo = parseInt(req.query.pageNo, 10) || 1;
                const { vendors, totalPages } = yield this.findAllVendorUseCase.findAllVendor(pageNo);
                console.log(vendors);
                res.status(httpStatus_1.HttpStatus.OK).json({
                    message: messages_1.Messages.VENDOR_FETCHED, vendors, totalPages
                });
                return;
            }
            catch (error) {
                //console.log('error while fetching all vendors', error)
                res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({
                    message: messages_1.Messages.VENDOR_FETCH_ERROR,
                    error: error instanceof Error ? error.message : messages_1.Messages.VENDOR_FETCH_ERROR
                });
            }
        });
    }
    findPendingVendor(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const pageNo = parseInt(req.query.pageNo, 10) || 1;
                const { pendingVendors, totalPages } = yield this.findPendingVendorUseCase.findPendingVendors(pageNo);
                res.status(httpStatus_1.HttpStatus.OK).json({ message: messages_1.Messages.PENDING_VENDORS_FETCHED, pendingVendors, totalPages });
                return;
            }
            catch (error) {
                //console.log('error while fetching pending vendors', error)
                res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({
                    message: messages_1.Messages.PENDING_VENDORS_FETCH_ERROR,
                    error: error instanceof Error ? error.message : messages_1.Messages.PENDING_VENDORS_FETCH_ERROR
                });
            }
        });
    }
}
exports.FindVendorController = FindVendorController;
