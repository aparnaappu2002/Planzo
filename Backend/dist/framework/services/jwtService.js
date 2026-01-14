"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class JwtService {
    createAccesstoken(accessSecretKey, userId, role) {
        const expiresIn = Number(process.env.ACCESS_TOKEN_EXPIRES_IN);
        return jsonwebtoken_1.default.sign({ userId, role }, accessSecretKey, { expiresIn });
    }
    createRefreshToken(refreshSecretKey, userId) {
        const expiresIn = Number(process.env.REFRESH_TOKEN_EXPIRES_IN);
        return jsonwebtoken_1.default.sign({ userId }, refreshSecretKey, { expiresIn });
    }
    verifyAccessToken(accessToken, accessSecretKey) {
        try {
            return jsonwebtoken_1.default.verify(accessToken, accessSecretKey);
        }
        catch (error) {
            return null;
        }
    }
    verifyRefreshToken(refreshToken, refreshSecretKey) {
        try {
            return jsonwebtoken_1.default.verify(refreshToken, refreshSecretKey);
        }
        catch (error) {
            return null;
        }
    }
    generateResetToken(resetSecretKey, userId, email) {
        const expiresIn = Number(process.env.RESET_TOKEN_EXPIRES_IN);
        return jsonwebtoken_1.default.sign({ userId, email, purpose: "password_reset" }, resetSecretKey, { expiresIn });
    }
    verifyPasswordResetToken(resetToken, resetSecretKey) {
        try {
            const decoded = jsonwebtoken_1.default.verify(resetToken, resetSecretKey);
            if (decoded.purpose !== "password_reset")
                return null;
            return decoded;
        }
        catch (error) {
            return null;
        }
    }
    tokenDecode(accessToken) {
        return jsonwebtoken_1.default.decode(accessToken);
    }
}
exports.JwtService = JwtService;
