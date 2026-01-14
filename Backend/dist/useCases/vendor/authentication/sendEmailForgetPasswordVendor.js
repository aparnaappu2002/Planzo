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
exports.sendEmailForgetPasswordVendor = void 0;
const emailComposer_1 = require("../../../framework/services/emailComposer");
class sendEmailForgetPasswordVendor {
    constructor(emailService, jwtService, vendorDatabase) {
        this.emailService = emailService;
        this.jwtService = jwtService;
        this.vendorDatabase = vendorDatabase;
    }
    sendEmailForgetPasswordVendor(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const vendor = yield this.vendorDatabase.findByEmaill(email);
            if (!vendor)
                throw new Error("No vendor Found with this email");
            const resetToken = this.jwtService.generateResetToken(process.env.RESET_SECRET_KEY, vendor.vendorId, email);
            const resetUrl = `${process.env.ORGIN}/vendor/resetPassword?token=${resetToken}&email=${email}`;
            const { subject, html } = emailComposer_1.EmailComposer.getResetPassword(resetToken, resetUrl);
            yield this.emailService.sendEmail(email, subject, html);
        });
    }
}
exports.sendEmailForgetPasswordVendor = sendEmailForgetPasswordVendor;
