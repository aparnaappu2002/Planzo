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
exports.ClientLoginController = void 0;
const tokenCookieSetting_1 = require("../../../../framework/services/tokenCookieSetting");
const httpStatus_1 = require("../../../../domain/enums/httpStatus");
const messages_1 = require("../../../../domain/enums/messages");
class ClientLoginController {
    constructor(clientLoginUseCase, jwtService, redisService, googleLoginClientUseCase) {
        this.clientLoginUseCase = clientLoginUseCase;
        this.jwtService = jwtService,
            this.redisService = redisService;
        this.googleLoginClientUseCase = googleLoginClientUseCase;
    }
    handleLogin(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const { email, password } = req.body;
                console.log('this is the email and the password', email, password);
                const client = yield this.clientLoginUseCase.loginClient(email, password);
                if (!client) {
                    res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({ message: messages_1.Messages.INVALID_CREDENTIALS });
                    return;
                }
                const ACCESSTOKEN_SECRET_KEY = process.env.ACCESSTOKEN_SECRET_KEY;
                const REFRESHTOKEN_SECRET_KEY = process.env.REFRESHTOKEN_SECRET_KEY;
                const accessToken = this.jwtService.createAccesstoken(ACCESSTOKEN_SECRET_KEY, ((_a = client._id) === null || _a === void 0 ? void 0 : _a.toString()) || "", client.role);
                const refreshToken = this.jwtService.createRefreshToken(REFRESHTOKEN_SECRET_KEY, ((_b = client._id) === null || _b === void 0 ? void 0 : _b.toString()) || "");
                yield this.redisService.set(`user:${client.role}:${client._id}`, 15 * 60, JSON.stringify(client.status));
                (0, tokenCookieSetting_1.setCookie)(res, refreshToken);
                const selectedFields = {
                    clientId: client.clientId,
                    email: client.email,
                    name: client.name,
                    phone: client.phone,
                    profileImage: client.profileImage,
                    _id: client._id,
                    role: client.role,
                    status: client.status
                };
                res.status(httpStatus_1.HttpStatus.OK).json({ message: messages_1.Messages.LOGIN_SUCCESS, client: selectedFields, accessToken });
            }
            catch (error) {
                console.log('error while login client', error);
                res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({
                    message: messages_1.Messages.LOGIN_ERROR,
                    error: error instanceof Error ? error.message : messages_1.Messages.LOGIN_ERROR
                });
            }
        });
    }
    handleGoogleLogin(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const { client } = req.body;
                const createdClient = yield this.googleLoginClientUseCase.googleLogin(client);
                console.log(createdClient);
                const ACCESSTOKEN_SECRET_KEY = process.env.ACCESSTOKEN_SECRET_KEY;
                const REFRESHTOKEN_SECRET_KEY = process.env.REFRESHTOKEN_SECRET_KEY;
                const accessToken = yield this.jwtService.createAccesstoken(ACCESSTOKEN_SECRET_KEY, ((_a = createdClient === null || createdClient === void 0 ? void 0 : createdClient._id) === null || _a === void 0 ? void 0 : _a.toString()) || '', createdClient === null || createdClient === void 0 ? void 0 : createdClient.role);
                const refreshToken = yield this.jwtService.createRefreshToken(REFRESHTOKEN_SECRET_KEY, ((_b = createdClient === null || createdClient === void 0 ? void 0 : createdClient._id) === null || _b === void 0 ? void 0 : _b.toString()) || '');
                yield this.redisService.set(`user:${createdClient === null || createdClient === void 0 ? void 0 : createdClient.role}:${createdClient === null || createdClient === void 0 ? void 0 : createdClient._id}`, 15 * 60, createdClient === null || createdClient === void 0 ? void 0 : createdClient.role);
                (0, tokenCookieSetting_1.setCookie)(res, refreshToken);
                const selectedFields = {
                    clientId: createdClient === null || createdClient === void 0 ? void 0 : createdClient.clientId,
                    email: createdClient === null || createdClient === void 0 ? void 0 : createdClient.email,
                    name: createdClient === null || createdClient === void 0 ? void 0 : createdClient.name,
                    phone: createdClient === null || createdClient === void 0 ? void 0 : createdClient.phone,
                    profileImage: createdClient === null || createdClient === void 0 ? void 0 : createdClient.profileImage,
                    _id: createdClient === null || createdClient === void 0 ? void 0 : createdClient._id,
                    role: createdClient === null || createdClient === void 0 ? void 0 : createdClient.role,
                    status: createdClient === null || createdClient === void 0 ? void 0 : createdClient.status,
                    googleVerified: createdClient === null || createdClient === void 0 ? void 0 : createdClient.googleVerified
                };
                res.status(httpStatus_1.HttpStatus.OK).json({ message: messages_1.Messages.GOOGLE_LOGIN_SUCCESS, client: selectedFields, accessToken });
            }
            catch (error) {
                console.log('error while google login', error);
                res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({
                    message: messages_1.Messages.GOOGLE_LOGIN_ERROR,
                    error: error instanceof Error ? error.message : messages_1.Messages.GOOGLE_LOGIN_ERROR
                });
            }
        });
    }
}
exports.ClientLoginController = ClientLoginController;
