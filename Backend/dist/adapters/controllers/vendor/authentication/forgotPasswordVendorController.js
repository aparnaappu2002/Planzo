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
exports.ForgotPasswordVendorController = void 0;
const httpStatus_1 = require("../../../../domain/enums/httpStatus");
class ForgotPasswordVendorController {
    constructor(sendEmailForgetPasswordVendor, resetPasswordVendorUseCase) {
        this.sendEmailForgetPasswordVendor = sendEmailForgetPasswordVendor;
        this.resetPasswordVendorUseCase = resetPasswordVendorUseCase;
    }
    handleSendEmailForgetPasswordVendor(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email } = req.body;
                yield this.sendEmailForgetPasswordVendor.sendEmailForgetPasswordVendor(email);
                res.status(httpStatus_1.HttpStatus.OK).json({
                    message: "Reset email sent successfully"
                });
            }
            catch (error) {
                console.log("Error while sending reset email:", error);
                res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({
                    message: "Error while sending reset email",
                    error: error instanceof Error ? error.message : "Error while sending reset email"
                });
            }
        });
    }
    handleResetPasswordVendor(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, newPassword, token } = req.body;
                const updatedClient = yield this.resetPasswordVendorUseCase.resetPasswordVendor(email, newPassword, token);
                res.status(httpStatus_1.HttpStatus.OK).json({
                    message: "Password reset successfully",
                    client: updatedClient
                });
            }
            catch (error) {
                console.log("Error while resetting the password:", error);
                res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({
                    message: "Error while resetting password",
                    error: error instanceof Error ? error.message : "Error while resetting the password"
                });
            }
        });
    }
}
exports.ForgotPasswordVendorController = ForgotPasswordVendorController;
