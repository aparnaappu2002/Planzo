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
exports.sendOtpClientUseCase = void 0;
const emailComposer_1 = require("../../../framework/services/emailComposer");
class sendOtpClientUseCase {
    constructor(otpService, emailService, userExistence) {
        this.otpService = otpService;
        this.emailService = emailService;
        this.userExistence = userExistence;
    }
    execute(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingUser = yield this.userExistence.emailExists(email);
            if (existingUser)
                throw new Error("This email is already exists");
            const otp = this.otpService.generateOtp();
            yield this.otpService.storeOtp(email, otp);
            const { subject, html } = emailComposer_1.EmailComposer.getOtpEmail(otp);
            yield this.emailService.sendEmail(email, subject, html);
        });
    }
    verifyOtp(email, enteredOtp) {
        return __awaiter(this, void 0, void 0, function* () {
            const verify = yield this.otpService.verifyOtp(email, enteredOtp);
            return verify;
        });
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
exports.sendOtpClientUseCase = sendOtpClientUseCase;
