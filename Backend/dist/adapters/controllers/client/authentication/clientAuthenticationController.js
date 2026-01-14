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
exports.ClientAuthenticationController = void 0;
const httpStatus_1 = require("../../../../domain/enums/httpStatus");
const messages_1 = require("../../../../domain/enums/messages");
class ClientAuthenticationController {
    constructor(clientUseCase, clientSendOtpUseCase) {
        this.clientUseCase = clientUseCase;
        this.clientSendOtpUseCase = clientSendOtpUseCase;
    }
    sendOtp(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = req.body;
                yield this.clientSendOtpUseCase.execute(data.email);
                res.status(httpStatus_1.HttpStatus.OK).json({ message: messages_1.Messages.OTP_SENT });
                return;
            }
            catch (error) {
                console.log("error while sending otp", error);
                res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({ message: messages_1.Messages.OTP_SEND_ERROR, error: error instanceof Error ? error.message : messages_1.Messages.OTP_SEND_ERROR });
            }
        });
    }
    register(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { formdata, otpString } = req.body;
                const verify = yield this.clientSendOtpUseCase.verifyOtp(formdata.email, otpString);
                if (verify) {
                    const client = yield this.clientUseCase.createClient(formdata);
                    res.status(httpStatus_1.HttpStatus.CREATED).json({ message: messages_1.Messages.ACCOUNT_CREATED, client });
                    return;
                }
                else {
                    res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({ message: messages_1.Messages.OTP_INVALID });
                }
            }
            catch (error) {
                console.log("error while creating client", error);
                res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({
                    message: messages_1.Messages.ACCOUNT_CREATE_ERROR,
                    error: error instanceof Error ? error.message : messages_1.Messages.ACCOUNT_CREATE_ERROR,
                    stack: error instanceof Error ? error.stack : undefined
                });
            }
        });
    }
    resendOtp(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email } = req.body;
                console.log('this is the email for resending the otp', email);
                yield this.clientSendOtpUseCase.resendOtp(email);
                res.status(httpStatus_1.HttpStatus.OK).json({ message: messages_1.Messages.OTP_RESENT });
            }
            catch (error) {
                console.log('error while resending the otp', error);
                res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({
                    message: messages_1.Messages.OTP_RESEND_ERROR,
                    error: error instanceof Error ? error.message : messages_1.Messages.OTP_RESEND_ERROR
                });
            }
        });
    }
}
exports.ClientAuthenticationController = ClientAuthenticationController;
