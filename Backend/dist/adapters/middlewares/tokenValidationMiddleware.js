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
exports.verifyTokenAndCheckBlackList = void 0;
const httpStatus_1 = require("../../domain/enums/httpStatus");
const verifyTokenAndCheckBlackList = (TokenService) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer')) {
            res.status(httpStatus_1.HttpStatus.UNAUTHORIZED).json({ message: 'Access denied. No token provided.' });
            return;
        }
        const token = authHeader.split(' ')[1];
        try {
            const isBlacklisted = yield TokenService.checkTokenBlacklist(token);
            if (isBlacklisted) {
                res.status(httpStatus_1.HttpStatus.FORBIDDEN).json({ message: "This token is blacklisted", error: "This token is blacklisted" });
                return;
            }
            const decoded = yield TokenService.verifyToken(token);
            req.user = decoded;
            next();
        }
        catch (error) {
            res.status(httpStatus_1.HttpStatus.FORBIDDEN).json({ message: 'Invalid token.', error: error instanceof Error ? error.message : 'invalid Token' });
        }
    });
};
exports.verifyTokenAndCheckBlackList = verifyTokenAndCheckBlackList;
