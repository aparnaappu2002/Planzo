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
exports.RefreshTokenUseCase = void 0;
class RefreshTokenUseCase {
    constructor(jwtService, clientRepository, vendorRepository, adminRepository) {
        this.adminRepository = adminRepository,
            this.clientRepository = clientRepository,
            this.jwtService = jwtService,
            this.vendorRepository = vendorRepository;
    }
    execute(token) {
        return __awaiter(this, void 0, void 0, function* () {
            const payload = this.jwtService.verifyRefreshToken(token, process.env.REFRESHTOKEN_SECRET_KEY);
            if (!payload)
                throw new Error('Invalid or Expired Refresh Token');
            const userId = payload.userId;
            const client = yield this.clientRepository.findById(userId);
            const vendor = yield this.vendorRepository.findById(userId);
            const admin = yield this.adminRepository.findById(userId);
            const user = client || vendor || admin;
            const role = client ? 'client' : vendor ? 'vendor' : admin ? 'admin' : null;
            if (!user || !role)
                throw new Error('User Not Found');
            const newAccessToken = this.jwtService.createAccesstoken(process.env.ACCESSTOKEN_SECRET_KEY, userId, role);
            return newAccessToken;
        });
    }
}
exports.RefreshTokenUseCase = RefreshTokenUseCase;
