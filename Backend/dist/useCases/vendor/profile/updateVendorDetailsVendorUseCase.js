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
exports.updateDetailsVendorUseCase = void 0;
class updateDetailsVendorUseCase {
    constructor(vendorDatabase) {
        this.vendorDatabase = vendorDatabase;
    }
    updateDetailsVendor(vendorId, about, phone, name) {
        return __awaiter(this, void 0, void 0, function* () {
            const updatedVendor = yield this.vendorDatabase.updateDetailsVendor(vendorId, about, phone, name);
            if (!updatedVendor)
                throw new Error('No vendor found in this ID');
            return updatedVendor;
        });
    }
}
exports.updateDetailsVendorUseCase = updateDetailsVendorUseCase;
