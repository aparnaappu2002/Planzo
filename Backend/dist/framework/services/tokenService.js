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
exports.TokenService = void 0;
class TokenService {
    constructor(redisService, jwtService, accessSecretKey) {
        this.redisService = redisService;
        this.jwtService = jwtService;
        this.accessSecretKey = accessSecretKey;
    }
    verifyToken(token) {
        return this.jwtService.verifyAccessToken(token, this.accessSecretKey);
    }
    checkTokenBlacklist(token) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.redisService.get(`blacklist:${token}`);
            return !!result;
        });
    }
}
exports.TokenService = TokenService;
