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
exports.SendOtpVendorUseCase = void 0;
const emailComposer_1 = require("../../../framework/services/emailComposer");
class SendOtpVendorUseCase {
    constructor(emailService, otpService, userExistence) {
        this.emailService = emailService;
        this.otpService = otpService;
        this.userExistence = userExistence;
    }
    execute(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingEmail = yield this.userExistence.emailExists(email);
            if (existingEmail) {
                throw new Error("This email already exists");
            }
            const otp = yield this.otpService.generateOtp();
            yield this.otpService.storeOtp(email, otp);
            const { subject, html } = emailComposer_1.EmailComposer.getOtpEmail(otp);
            const sendEmail = this.emailService.sendEmail(email, subject, html);
        });
    }
    verifyOtp(email, enteredOtp) {
        return __awaiter(this, void 0, void 0, function* () {
            const otpverification = yield this.otpService.verifyOtp(email, enteredOtp);
            return otpverification;
        });
    }
    resendOtp(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const otp = yield this.otpService.generateOtp();
            yield this.otpService.storeOtp(email, otp);
            const { subject, html } = emailComposer_1.EmailComposer.getOtpEmail(otp);
            const sendEmail = this.emailService.sendEmail(email, subject, html);
        });
    }
}
exports.SendOtpVendorUseCase = SendOtpVendorUseCase;
