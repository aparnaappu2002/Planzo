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
exports.ForgotPasswordClient = void 0;
const httpStatus_1 = require("../../../../domain/enums/httpStatus");
const messages_1 = require("../../../../domain/enums/messages");
class ForgotPasswordClient {
    constructor(sendResetEmailClientUseCase, resetPasswordClientUseCase) {
        this.sendResetEmailClientUseCase = sendResetEmailClientUseCase;
        this.resetPasswordClientUseCase = resetPasswordClientUseCase;
    }
    handleSendResetEmail(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email } = req.body;
                yield this.sendResetEmailClientUseCase.sendMailForForgetPassword(email);
                res.status(httpStatus_1.HttpStatus.OK).json({ message: messages_1.Messages.PASSWORD_RESET_SENT });
            }
            catch (error) {
                console.log("Error while sending reset email:", error);
                res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({
                    message: messages_1.Messages.PASSWORD_RESET_SENT_ERROR,
                    error: error instanceof Error ? error.message : messages_1.Messages.PASSWORD_RESET_SENT_ERROR
                });
            }
        });
    }
    handleResetPassword(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, newPassword, token } = req.body;
                const updatedClient = yield this.resetPasswordClientUseCase.resetPassword(email, newPassword, token);
                res.status(httpStatus_1.HttpStatus.OK).json({
                    message: messages_1.Messages.PASSWORD_RESET_SUCCESS,
                    client: updatedClient
                });
            }
            catch (error) {
                console.log("Error while resetting password:", error);
                res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({
                    message: messages_1.Messages.PASSWORD_RESET_ERROR,
                    error: error instanceof Error ? error.message : messages_1.Messages.PASSWORD_RESET_ERROR
                });
            }
        });
    }
}
exports.ForgotPasswordClient = ForgotPasswordClient;
