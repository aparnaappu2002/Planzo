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
exports.LoginVendorUseCase = void 0;
const hashPassword_1 = require("../../../framework/hashpassword/hashPassword");
class LoginVendorUseCase {
    constructor(vendorDatabase) {
        this.vendorDatabase = vendorDatabase;
        this.hashPassword = new hashPassword_1.hashPassword();
    }
    loginVendor(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const vendor = yield this.vendorDatabase.findByEmaill(email);
            console.log("Vendor:", vendor);
            if (!vendor)
                throw new Error("No vendor exists in the email");
            if (vendor.status == 'block')
                throw new Error("You are blocked by admin");
            const verifyPassword = yield this.hashPassword.comparePassword(password, vendor.password);
            if (!verifyPassword)
                throw new Error("Invalid password");
            return vendor;
        });
    }
}
exports.LoginVendorUseCase = LoginVendorUseCase;
