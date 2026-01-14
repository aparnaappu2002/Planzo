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
exports.VendorLogoutUseCase = void 0;
class VendorLogoutUseCase {
    constructor(redisService, jwtService) {
        this.redisService = redisService;
        this.jwtService = jwtService;
    }
    vendorLogout(token) {
        return __awaiter(this, void 0, void 0, function* () {
            const decode = this.jwtService.tokenDecode(token);
            const exp = decode === null || decode === void 0 ? void 0 : decode.exp;
            if (!exp)
                throw new Error('Invalid Token');
            const currentTime = Math.floor(Date.now() / 1000);
            const ttl = exp - currentTime;
            if (ttl > 0) {
                yield this.redisService.set(`blacklist:${token}`, ttl, 'true');
                return true;
            }
            return false;
        });
    }
}
exports.VendorLogoutUseCase = VendorLogoutUseCase;
