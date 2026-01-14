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
exports.ChangePasswordVendorUseCase = void 0;
class ChangePasswordVendorUseCase {
    constructor(vendorDatabase, hashPassword) {
        this.vendorDatabase = vendorDatabase;
        this.hashPassword = hashPassword;
    }
    changePasswordVendor(vendorId, newPassword, oldPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            const passwordInDb = yield this.vendorDatabase.findPassword(vendorId);
            if (!passwordInDb)
                throw new Error("No vendor Found in this ID");
            const verifyOldPassword = yield this.hashPassword.comparePassword(oldPassword, passwordInDb);
            if (!verifyOldPassword)
                throw new Error("Old password is not correct");
            const checkNewPasswordWithOld = yield this.hashPassword.comparePassword(newPassword, passwordInDb);
            if (checkNewPasswordWithOld)
                throw new Error('Cant use old password as new password');
            const hashedPassword = yield this.hashPassword.hashPassword(newPassword);
            if (!hashedPassword)
                throw new Error('Error while hashing password');
            return yield this.vendorDatabase.changePassword(vendorId, hashedPassword);
        });
    }
}
exports.ChangePasswordVendorUseCase = ChangePasswordVendorUseCase;
