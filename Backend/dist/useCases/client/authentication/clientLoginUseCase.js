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
exports.LoginClientUseCase = void 0;
const hashPassword_1 = require("../../../framework/hashpassword/hashPassword");
class LoginClientUseCase {
    constructor(clientDatabase) {
        this.clientDatabase = clientDatabase;
        this.hashpassword = new hashPassword_1.hashPassword();
    }
    loginClient(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield this.clientDatabase.findByEmail(email);
            if (!client)
                throw new Error('No client exists with this email');
            if (client.status == "block")
                throw new Error("client is blocked by admin");
            const isPasswordValid = yield this.hashpassword.comparePassword(password, client.password);
            if (!isPasswordValid)
                throw new Error("Invalid password");
            return client;
        });
    }
}
exports.LoginClientUseCase = LoginClientUseCase;
