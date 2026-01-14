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
exports.VendorAuthenticationController = void 0;
const httpStatus_1 = require("../../../../domain/enums/httpStatus");
class VendorAuthenticationController {
    constructor(vendorAuthenticationUseCase, vendorSendOtp, resendOtpVendorUseCase) {
        this.vendorAuthenticationUseCase = vendorAuthenticationUseCase;
        this.vendorSendOtp = vendorSendOtp;
        this.resendOtpVendoUseCase = resendOtpVendorUseCase;
    }
    sendOtp(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const vendor = req.body;
                yield this.vendorSendOtp.execute(vendor.email);
                res.status(httpStatus_1.HttpStatus.OK).json({ message: "otp sended ot the email" });
                return;
            }
            catch (error) {
                console.log("error while sending otp", error);
                res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({
                    message: "Error while sending the otp",
                    error: error instanceof Error ? error.message : "Unknown error",
                    stack: error instanceof Error ? error.stack : undefined
                });
            }
        });
    }
    registerVendor(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { formdata, enteredOtp } = req.body;
                console.log(req.body);
                const otpverification = yield this.vendorSendOtp.verifyOtp(formdata.email, enteredOtp);
                if (!otpverification) {
                    res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({
                        message: "Invalid otp"
                    });
                    return;
                }
                const vendor = yield this.vendorAuthenticationUseCase.signupVendor(formdata);
                res.status(httpStatus_1.HttpStatus.OK).json({
                    message: "Vendor created", vendor
                });
            }
            catch (error) {
                console.log("error while verifying otp", error);
                res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({
                    message: "Error while verifying client",
                    error: error instanceof Error ? error.message : "Unknown error",
                    stack: error instanceof Error ? error.stack : undefined
                });
                return;
            }
        });
    }
    handleResendOtp(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email } = req.body;
                yield this.resendOtpVendoUseCase.resendOtp(email);
                res.status(httpStatus_1.HttpStatus.OK).json({
                    message: "Resended the otp"
                });
            }
            catch (error) {
                console.log('error while resending otp in vendor', error);
                res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({
                    message: "error while resending otp",
                    error: error instanceof Error ? error.message : "error while resending otp"
                });
            }
        });
    }
}
exports.VendorAuthenticationController = VendorAuthenticationController;
