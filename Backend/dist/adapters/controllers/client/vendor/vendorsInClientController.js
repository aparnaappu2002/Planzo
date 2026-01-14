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
exports.VendorForClientController = void 0;
const httpStatus_1 = require("../../../../domain/enums/httpStatus");
const messages_1 = require("../../../../domain/enums/messages");
class VendorForClientController {
    constructor(findVendorForClientUseCase, findVendorProfileUseCase) {
        this.findVendorForClientUseCase = findVendorForClientUseCase;
        this.findVendorProfileUseCase = findVendorProfileUseCase;
    }
    handleFindVendorForClient(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const vendors = yield this.findVendorForClientUseCase.findVendorForClientUseCase();
                res.status(httpStatus_1.HttpStatus.OK).json({ message: messages_1.Messages.VENDOR_FETCHED, vendors });
            }
            catch (error) {
                console.log('error while finding vendors for client carousal', error);
                res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({
                    message: messages_1.Messages.VENDORS_FETCH_ERROR,
                    error: error instanceof Error ? error.message : messages_1.Messages.VENDORS_FETCH_ERROR
                });
            }
        });
    }
    handleFindVendorProfile(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { vendorId, PageNo } = req.params;
                const page = parseInt(PageNo, 10) || 1;
                const { services, totalPages, vendorProfile } = yield this.findVendorProfileUseCase.findVendorProfile(vendorId, page);
                res.status(httpStatus_1.HttpStatus.OK).json({
                    message: messages_1.Messages.PROFILE_FETCHED,
                    vendorProfile,
                    services,
                    totalPages
                });
            }
            catch (error) {
                console.log('error while finding the vendor profile', error);
                res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({
                    message: messages_1.Messages.PROFILE_FETCH_ERROR,
                    error: error instanceof Error ? error.message : messages_1.Messages.PROFILE_FETCH_ERROR
                });
            }
        });
    }
}
exports.VendorForClientController = VendorForClientController;
