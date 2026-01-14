"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailComposer = void 0;
const otpTemplate_1 = require("../../templates/otpTemplate");
const resetPasswordEmailTemplate_1 = require("../../templates/resetPasswordEmailTemplate");
class EmailComposer {
    static getOtpEmail(otp) {
        return {
            subject: 'Your OTP Code',
            html: (0, otpTemplate_1.otpEmailTemplate)(otp)
        };
    }
    static getResetPassword(token, url) {
        return {
            subject: "Password Reset Request",
            html: (0, resetPasswordEmailTemplate_1.resetPasswordEmailTemplate)(token, url)
        };
    }
}
exports.EmailComposer = EmailComposer;
