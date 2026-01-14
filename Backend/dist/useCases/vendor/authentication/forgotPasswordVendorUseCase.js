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
exports.ResetPasswordVendorUseCase = void 0;
const hashPassword_1 = require("../../../framework/hashpassword/hashPassword");
class ResetPasswordVendorUseCase {
    constructor(jwtService, vendorDatabase) {
        this.jwtService = jwtService;
        this.vendorDatabase = vendorDatabase;
        this.hashPassword = new hashPassword_1.hashPassword();
    }
    resetPasswordVendor(email, newPassword, token) {
        return __awaiter(this, void 0, void 0, function* () {
            const isValidToken = yield this.jwtService.verifyPasswordResetToken(token, process.env.RESET_SECRET_KEY);
            if (!isValidToken) {
                throw new Error("Invalid or expired reset token");
            }
            const vendor = yield this.vendorDatabase.findByEmaill(email);
            if (!vendor) {
                throw new Error("No vendor found with this email");
            }
            const hashedPassword = yield this.hashPassword.hashPassword(newPassword);
            const updateVendor = yield this.vendorDatabase.resetPassword(vendor.vendorId, hashedPassword);
            if (!updateVendor) {
                throw new Error("Failed to update password. Vendor may no longer exist");
            }
        });
    }
}
exports.ResetPasswordVendorUseCase = ResetPasswordVendorUseCase;
