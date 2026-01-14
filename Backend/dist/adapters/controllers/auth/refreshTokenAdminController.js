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
exports.RefreshTokenAdminController = void 0;
const httpStatus_1 = require("../../../domain/enums/httpStatus");
class RefreshTokenAdminController {
    constructor(refreshTokenUseCase) {
        this.refreshTokenUseCase = refreshTokenUseCase;
    }
    handleRefreshToken(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const refreshToken = req.cookies.refreshtoken;
                if (!refreshToken) {
                    res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({ error: "No refreshToken found" });
                    return;
                }
                const newAccessToken = yield this.refreshTokenUseCase.execute(refreshToken);
                res.status(httpStatus_1.HttpStatus.OK).json({ message: 'New Access Token Created', newAccessToken });
            }
            catch (error) {
                console.log('error while handling refresh Token', error);
                res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({
                    message: "error while handlling refresh Token",
                    error: error instanceof Error ? error.message : 'error while handling refresh Token'
                });
            }
        });
    }
}
exports.RefreshTokenAdminController = RefreshTokenAdminController;
