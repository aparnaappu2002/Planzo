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
exports.sendMailForgetPasswordClient = void 0;
const emailComposer_1 = require("../../../framework/services/emailComposer");
class sendMailForgetPasswordClient {
    constructor(resetMailService, jwtService, clientDatabase) {
        this.resetMailService = resetMailService;
        this.jwtService = jwtService;
        this.clientDatabase = clientDatabase;
    }
    sendMailForForgetPassword(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield this.clientDatabase.findByEmail(email);
            if (!client)
                throw new Error("No Client found with this email");
            if (client.googleVerified)
                throw new Error("This account is linked to Google.Please reset your password through your google account settings");
            const resetToken = this.jwtService.generateResetToken(process.env.RESET_SECRET_KEY, client.clientId, email);
            const resetUrl = `${process.env.ORGIN}/resetPassword?token=${resetToken}&email=${email}`;
            const { subject, html } = emailComposer_1.EmailComposer.getResetPassword(resetToken, resetUrl);
            yield this.resetMailService.sendEmail(email, subject, html);
        });
    }
}
exports.sendMailForgetPasswordClient = sendMailForgetPasswordClient;
