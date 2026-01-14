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
exports.AdminLoginUseCase = void 0;
const hashPassword_1 = require("../../../framework/hashpassword/hashPassword");
const randomUuid_1 = require("../../../framework/services/randomUuid");
class AdminLoginUseCase {
    constructor(adminRepository, walletDatabase) {
        this.adminRepository = adminRepository;
        this.hashPassword = new hashPassword_1.hashPassword();
        this.walletDatabase = walletDatabase;
    }
    handleLogin(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const admin = yield this.adminRepository.findByEmail(email);
            if (!admin)
                throw new Error("Admin not exist in this email");
            if (!admin.isAdmin)
                throw new Error("You are not Admin");
            const passwordVerify = yield this.hashPassword.comparePassword(password, admin.password);
            if (!passwordVerify)
                throw new Error("Invalid password");
            const walletId = (0, randomUuid_1.generateRandomUuid)();
            const existingWallet = yield this.walletDatabase.findWalletByUserId(admin._id);
            if (!existingWallet) {
                const walletDetails = {
                    balance: 0,
                    userId: admin._id,
                    userModel: "client",
                    walletId,
                };
                const createWallet = yield this.walletDatabase.createWallet(walletDetails);
                if (!createWallet)
                    throw new Error("Error while creating waller");
            }
            return admin;
        });
    }
}
exports.AdminLoginUseCase = AdminLoginUseCase;
