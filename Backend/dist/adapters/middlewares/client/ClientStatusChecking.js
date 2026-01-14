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
exports.clientStatusCheckingMiddleware = void 0;
const httpStatus_1 = require("../../../domain/enums/httpStatus");
const clientStatusCheckingMiddleware = (redisService, clientDatabase) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const user = req.user;
        let status = yield redisService.get(`user:${user.userId}:${user.role}`);
        console.log('status of user', status);
        if (!status) {
            status = yield clientDatabase.findStatusForMiddleware(user.userId);
            yield redisService.set(`user:${user.userId}:${user.role}`, 15 * 60, JSON.stringify(status));
        }
        if (status === '"block"') {
            res.status(httpStatus_1.HttpStatus.FORBIDDEN).json({ message: "User blocked by admin", code: "USER_BLOCKED" });
            return;
        }
        next();
    });
};
exports.clientStatusCheckingMiddleware = clientStatusCheckingMiddleware;
