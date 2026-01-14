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
exports.RejectVendorUseCase = void 0;
class RejectVendorUseCase {
    constructor(vendorDatabase) {
        this.vendorDatabase = vendorDatabase;
    }
    rejectVendor(vendorid, newStatus, rejectionReason) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingVendor = yield this.vendorDatabase.findById(vendorid);
            if (!existingVendor)
                throw new Error('No vendor Exist');
            const vendor = yield this.vendorDatabase.rejectPendingVendor(vendorid, newStatus, rejectionReason);
            return vendor;
        });
    }
}
exports.RejectVendorUseCase = RejectVendorUseCase;
