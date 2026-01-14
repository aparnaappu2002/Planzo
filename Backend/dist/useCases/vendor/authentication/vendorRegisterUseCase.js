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
exports.VendorRegisterUseCase = void 0;
const hashPassword_1 = require("../../../framework/hashpassword/hashPassword");
const randomUuid_1 = require("../../../framework/services/randomUuid");
class VendorRegisterUseCase {
    constructor(vendorDatabase) {
        this.vendorDatabase = vendorDatabase;
        this.hashPassword = new hashPassword_1.hashPassword();
    }
    signupVendor(vendor) {
        return __awaiter(this, void 0, void 0, function* () {
            const oldVendor = yield this.vendorDatabase.findByEmaill(vendor.email);
            if (oldVendor)
                throw new Error("Already vendor exist in this email");
            const hashedPassword = yield this.hashPassword.hashPassword(vendor.password);
            const vendorId = (0, randomUuid_1.generateRandomUuid)();
            const newVendor = yield this.vendorDatabase.createVendor({
                name: vendor.name,
                email: vendor.email,
                password: hashedPassword,
                role: 'vendor',
                vendorId,
                idProof: vendor.idProof,
                phone: vendor.phone,
                vendorStatus: 'pending'
            });
            return newVendor;
        });
    }
}
exports.VendorRegisterUseCase = VendorRegisterUseCase;
