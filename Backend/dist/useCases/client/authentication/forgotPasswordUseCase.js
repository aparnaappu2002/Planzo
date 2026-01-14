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
exports.ResetPasswordClientUseCase = void 0;
const hashPassword_1 = require("../../../framework/hashpassword/hashPassword");
class ResetPasswordClientUseCase {
    constructor(jwtService, clientDatabase) {
        this.jwtService = jwtService;
        this.clientDatabase = clientDatabase;
        this.hashPassword = new hashPassword_1.hashPassword();
    }
    resetPassword(email, newPassword, token) {
        return __awaiter(this, void 0, void 0, function* () {
            const isValidToken = yield this.jwtService.verifyPasswordResetToken(token, process.env.RESET_SECRET_KEY);
            if (!isValidToken) {
                throw new Error("Invalid or expired reset token");
            }
            const client = yield this.clientDatabase.findByEmail(email);
            if (!client) {
                throw new Error("No client found with this email");
            }
            const hashedPassword = yield this.hashPassword.hashPassword(newPassword);
            const updatedClient = yield this.clientDatabase.resetPassword(client.clientId, hashedPassword);
            if (!updatedClient) {
                throw new Error("Failed to update password. Client may no longer exist.");
            }
        });
    }
}
exports.ResetPasswordClientUseCase = ResetPasswordClientUseCase;
