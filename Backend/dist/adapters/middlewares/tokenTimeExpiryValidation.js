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
exports.tokenTimeExpiryValidationMiddleware = void 0;
const httpStatus_1 = require("../../domain/enums/httpStatus");
const tokenTimeExpiryValidationMiddleware = (jwtService) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({ message: 'No token provided' });
            return;
        }
        const token = authHeader.split(' ')[1];
        try {
            const decoded = yield jwtService.tokenDecode(token);
            if (!decoded || !decoded.exp) {
                res.status(httpStatus_1.HttpStatus.UNAUTHORIZED).json({ error: 'Token expiration done' });
                return;
            }
            const currentTime = Math.floor(Date.now() / 1000);
            const timeLeft = decoded.exp - currentTime;
            if (timeLeft <= 0) {
                res.status(httpStatus_1.HttpStatus.UNAUTHORIZED).json({ error: "Token Expired" });
                return;
            }
            next();
        }
        catch (error) {
            console.log('error while checking the Token expiry', error);
            res.status(httpStatus_1.HttpStatus.INTERNAL_SERVER_ERROR).json({ error: "error while checking the token expiry" });
        }
    });
};
exports.tokenTimeExpiryValidationMiddleware = tokenTimeExpiryValidationMiddleware;
