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
exports.ApproveVendorUseCase = void 0;
var VendorStatus;
(function (VendorStatus) {
    VendorStatus["Approved"] = "approved";
    VendorStatus["Rejected"] = "rejected";
})(VendorStatus || (VendorStatus = {}));
class ApproveVendorUseCase {
    constructor(vendorDatabase) {
        this.vendorDatabase = vendorDatabase;
    }
    approveVendor(vendorId, newStatus) {
        return __awaiter(this, void 0, void 0, function* () {
            const vendorExisting = yield this.vendorDatabase.findById(vendorId);
            if (!vendorExisting)
                throw new Error('There is no vendor exists in this ID');
            const vendor = yield this.vendorDatabase.changeVendorStatus(vendorId, newStatus);
            return vendor;
        });
    }
}
exports.ApproveVendorUseCase = ApproveVendorUseCase;
