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
exports.ChangePasswordClientUseCase = void 0;
class ChangePasswordClientUseCase {
    constructor(clientDatabase, hashPassword) {
        this.hashPassword = hashPassword;
        this.clientDatabase = clientDatabase;
    }
    changePasswordClient(clientId, Oldpassword, newPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            const clientOldPassword = yield this.clientDatabase.findPassword(clientId);
            if (!clientOldPassword)
                throw new Error('No user Found in this ID');
            const ComparedPassword = yield this.hashPassword.comparePassword(Oldpassword, clientOldPassword);
            if (!ComparedPassword)
                throw new Error('Old password is not correct');
            const checkingOldPasswordIsSameAsNew = yield this.hashPassword.comparePassword(newPassword, clientOldPassword);
            if (checkingOldPasswordIsSameAsNew)
                throw new Error("Cant use Old password as new again");
            const hashedPassword = yield this.hashPassword.hashPassword(newPassword);
            if (!hashedPassword)
                throw new Error('Error while hashing password');
            return yield this.clientDatabase.changePassword(clientId, hashedPassword);
        });
    }
}
exports.ChangePasswordClientUseCase = ChangePasswordClientUseCase;
