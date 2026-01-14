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
exports.ResendOtpVendorUseCase = void 0;
const emailComposer_1 = require("../../../framework/services/emailComposer");
class ResendOtpVendorUseCase {
    constructor(emailService, otpService) {
        this.emailService = emailService;
        this.otpService = otpService;
    }
    resendOtp(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const otp = this.otpService.generateOtp();
            yield this.otpService.storeOtp(email, otp);
            const { subject, html } = emailComposer_1.EmailComposer.getOtpEmail(otp);
            yield this.emailService.sendEmail(email, subject, html);
        });
    }
}
exports.ResendOtpVendorUseCase = ResendOtpVendorUseCase;
