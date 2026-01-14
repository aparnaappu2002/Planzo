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
exports.CreateClientUseCase = void 0;
const hashPassword_1 = require("../../../framework/hashpassword/hashPassword");
const randomUuid_1 = require("../../../framework/services/randomUuid");
class CreateClientUseCase {
    constructor(clientRepository) {
        this.clientRepository = clientRepository;
        this.hashpassword = new hashPassword_1.hashPassword();
    }
    createClient(client) {
        return __awaiter(this, void 0, void 0, function* () {
            const oldClient = yield this.clientRepository.findByEmail(client.email);
            if (oldClient) {
                throw new Error("user already exist");
            }
            const { password, email, phone, name, googleVerified } = client;
            let hashedPassword = null;
            if (password) {
                hashedPassword = yield this.hashpassword.hashPassword(password);
                console.log(hashedPassword);
            }
            const clientId = (0, randomUuid_1.generateRandomUuid)();
            const newClient = yield this.clientRepository.createClient({
                name,
                phone,
                email,
                password: hashedPassword !== null && hashedPassword !== void 0 ? hashedPassword : "",
                clientId,
                role: "client",
                isAdmin: false,
                googleVerified
            });
            return newClient;
        });
    }
}
exports.CreateClientUseCase = CreateClientUseCase;
