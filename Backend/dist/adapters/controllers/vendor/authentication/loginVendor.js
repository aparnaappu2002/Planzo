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
exports.LoginLogoutVendorController = void 0;
const tokenCookieSettingVendor_1 = require("../../../../framework/services/tokenCookieSettingVendor");
const httpStatus_1 = require("../../../../domain/enums/httpStatus");
class LoginLogoutVendorController {
    constructor(vendorLoginUseCase, jwtService, redisService, vendorLogoutUseCase) {
        this.vendorLoginUseCase = vendorLoginUseCase;
        this.jwtService = jwtService;
        this.redisService = redisService;
        this.vendorLogoutUseCase = vendorLogoutUseCase;
    }
    handleLoginVendor(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const { email, password } = req.body;
                const vendor = yield this.vendorLoginUseCase.loginVendor(email, password);
                const modifiedVendor = {
                    _id: vendor === null || vendor === void 0 ? void 0 : vendor._id,
                    email: vendor === null || vendor === void 0 ? void 0 : vendor.email,
                    name: vendor === null || vendor === void 0 ? void 0 : vendor.name,
                    phone: vendor === null || vendor === void 0 ? void 0 : vendor.phone,
                    role: vendor === null || vendor === void 0 ? void 0 : vendor.role,
                    status: vendor === null || vendor === void 0 ? void 0 : vendor.status,
                    vendorId: vendor === null || vendor === void 0 ? void 0 : vendor.vendorId,
                    vendorStatus: vendor === null || vendor === void 0 ? void 0 : vendor.vendorStatus,
                    rejectReason: vendor === null || vendor === void 0 ? void 0 : vendor.rejectionReason,
                    profileImage: vendor === null || vendor === void 0 ? void 0 : vendor.idProof,
                };
                if (!vendor)
                    throw new Error("Invalid credentials");
                const accessTokenSecretKey = process.env.ACCESSTOKEN_SECRET_KEY;
                const refreshTokenSecretKey = process.env
                    .REFRESHTOKEN_SECRET_KEY;
                const accessToken = yield this.jwtService.createAccesstoken(accessTokenSecretKey, ((_a = vendor._id) === null || _a === void 0 ? void 0 : _a.toString()) || "", vendor.role);
                const refreshToken = yield this.jwtService.createRefreshToken(refreshTokenSecretKey, ((_b = vendor._id) === null || _b === void 0 ? void 0 : _b.toString()) || "");
                (0, tokenCookieSettingVendor_1.setCookieVendor)(res, refreshToken);
                yield this.redisService.set(`user:${vendor.role}:${vendor._id}`, 15 * 60, JSON.stringify({
                    status: vendor.status,
                    vendorStatus: vendor.vendorStatus,
                }));
                const valueFromRedis = yield this.redisService.get(`user:${vendor.role}:${vendor._id}`);
                console.log("value from redis", valueFromRedis);
                res
                    .status(httpStatus_1.HttpStatus.OK)
                    .json({
                    message: "vendor login successfull",
                    vendor: modifiedVendor,
                    accessToken,
                });
                return;
            }
            catch (error) {
                res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({
                    message: "error while login vendor",
                    error: error instanceof Error ? error.message : "error while login vendor",
                });
                return;
            }
        });
    }
    handleVendorLogout(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const authHeader = req.headers.authorization;
                if (!authHeader || !authHeader.startsWith('Bearer ')) {
                    res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({ message: 'Authorization header missing' });
                    return;
                }
                const token = authHeader.split(' ')[1];
                yield this.vendorLogoutUseCase.vendorLogout(token);
                res.status(httpStatus_1.HttpStatus.OK).json({ message: "Logout successful" });
            }
            catch (error) {
                console.log('error while handling logout client', error);
                res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({
                    message: 'error while handling logout client',
                    error: error instanceof Error ? error.message : 'error while handling logout client'
                });
            }
        });
    }
}
exports.LoginLogoutVendorController = LoginLogoutVendorController;
