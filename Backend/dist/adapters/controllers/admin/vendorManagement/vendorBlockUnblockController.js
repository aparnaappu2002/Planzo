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
exports.VendorBlockUnblockController = void 0;
const httpStatus_1 = require("../../../../domain/enums/httpStatus");
const messages_1 = require("../../../../domain/enums/messages");
class VendorBlockUnblockController {
    constructor(vendorUnblockUseCase, vendorBlockUseCase, searchVendorUseCase, redisService) {
        this.vendorBlockUseCase = vendorBlockUseCase;
        this.vendorUnblockUseCase = vendorUnblockUseCase;
        this.searchVendorUseCase = searchVendorUseCase;
        this.redisService = redisService;
    }
    handleVendorBlock(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { vendorId } = req.body;
                const blockVendor = yield this.vendorBlockUseCase.blockVendor(vendorId);
                const changeStatusRedis = yield this.redisService.set(`user:vendor:${vendorId}`, 15 * 60, JSON.stringify({ status: 'block', vendorStatus: 'approved' }));
                if (blockVendor)
                    res.status(httpStatus_1.HttpStatus.OK).json({
                        message: messages_1.Messages.VENDOR_BLOCKED
                    });
            }
            catch (error) {
                console.log('error while blocking Vendor', error);
                res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({
                    message: messages_1.Messages.VENDOR_BLOCK_ERROR,
                    error: error instanceof Error ? error.message : messages_1.Messages.VENDOR_BLOCK_ERROR
                });
            }
        });
    }
    handleVendorUnblock(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { vendorId } = req.body;
                const unblockUser = yield this.vendorUnblockUseCase.vendorUnblock(vendorId);
                const changeStatusRedis = yield this.redisService.set(`user:vendor:${vendorId}`, 15 * 60, JSON.stringify({ status: 'active', vendorStatus: 'approved' }));
                if (unblockUser)
                    res.status(httpStatus_1.HttpStatus.OK).json({ message: messages_1.Messages.VENDOR_UNBLOCKED });
            }
            catch (error) {
                console.log(messages_1.Messages.VENDOR_UNBLOCK_ERROR, error);
                res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({
                    message: "error while unblocking vendor",
                    error: error instanceof Error ? error.message : messages_1.Messages.VENDOR_UNBLOCK_ERROR
                });
            }
        });
    }
    searchVendor(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const search = req.query.search;
                if (!search) {
                    res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({
                        message: messages_1.Messages.SEARCH_QUERY_REQUIRED
                    });
                    return;
                }
                const vendors = yield this.searchVendorUseCase.searchVendors(search);
                res.status(httpStatus_1.HttpStatus.OK).json({
                    message: messages_1.Messages.VENDOR_FETCHED,
                    vendors
                });
            }
            catch (error) {
                console.log("Error while searching vendors", error);
                res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({
                    message: messages_1.Messages.VENDOR_SEARCH_ERROR,
                    error: error instanceof Error ? error.message : messages_1.Messages.VENDOR_SEARCH_ERROR
                });
            }
        });
    }
}
exports.VendorBlockUnblockController = VendorBlockUnblockController;
