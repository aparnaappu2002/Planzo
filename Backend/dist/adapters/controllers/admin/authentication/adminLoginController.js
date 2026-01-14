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
exports.AdminLoginController = void 0;
const tokenCookieSetting_1 = require("../../../../framework/services/tokenCookieSetting");
const httpStatus_1 = require("../../../../domain/enums/httpStatus");
const messages_1 = require("../../../../domain/enums/messages");
class AdminLoginController {
    constructor(adminLoginUseCase, jwtService, redisService) {
        this.adminLoginUseCase = adminLoginUseCase;
        this.jwtService = jwtService;
        this.redisService = redisService;
    }
    handleAdminLogin(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const { email, password } = req.body;
                //console.log(req.body);
                if (!email) {
                    res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({
                        message: messages_1.Messages.INVALID_EMAIL,
                    });
                    return;
                }
                else if (!password) {
                    res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({
                        message: messages_1.Messages.INVALID_PASSWORD,
                    });
                }
                const admin = yield this.adminLoginUseCase.handleLogin(email, password);
                if (!admin) {
                    res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({
                        message: messages_1.Messages.INVALID_CREDENTIALS,
                    });
                    return;
                }
                const accessSecretKey = process.env.ACCESSTOKEN_SECRET_KEY;
                const refreshSecretKey = process.env.REFRESHTOKEN_SECRET_KEY;
                const accessToken = yield this.jwtService.createAccesstoken(accessSecretKey, ((_a = admin._id) === null || _a === void 0 ? void 0 : _a.toString()) || "", admin.role);
                const refreshToken = yield this.jwtService.createRefreshToken(refreshSecretKey, ((_b = admin._id) === null || _b === void 0 ? void 0 : _b.toString()) || "");
                yield this.redisService.set(`user:admin:${admin._id}`, 15 * 60, JSON.stringify(admin.status));
                yield this.redisService.set(`adminRole`, 15 * 60, JSON.stringify(admin.isAdmin));
                (0, tokenCookieSetting_1.setCookie)(res, refreshToken);
                res.status(httpStatus_1.HttpStatus.OK).json({
                    message: messages_1.Messages.LOGIN_SUCCESS,
                    accessToken,
                    id: admin._id,
                });
                return;
            }
            catch (error) {
                //console.log("Error while admin login", error);
                res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({
                    message: messages_1.Messages.LOGIN_ERROR,
                    error: error instanceof Error ? error.message : messages_1.Messages.LOGIN_ERROR,
                });
            }
        });
    }
}
exports.AdminLoginController = AdminLoginController;
