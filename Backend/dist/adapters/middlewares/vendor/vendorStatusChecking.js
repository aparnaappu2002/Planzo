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
exports.vendorStatusCheckingMiddleware = void 0;
const httpStatus_1 = require("../../../domain/enums/httpStatus");
const vendorStatusCheckingMiddleware = (redisService, vendorDatabse) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const user = req.user;
        const status = yield redisService.get(`user:${user.role}:${user.userId}`);
        if (status) {
            const data = JSON.parse(status);
            if (data.status !== 'active') {
                res.status(httpStatus_1.HttpStatus.FORBIDDEN).json({ message: "User blocked by admin", code: "USER_BLOCKED" });
                return;
            }
            if (data.vendorStatus !== 'approved') {
                res.status(httpStatus_1.HttpStatus.FORBIDDEN).json({ message: "Vendor not approved by admin", code: "NOT_APPROVED" });
                return;
            }
            return next();
        }
        else {
            const vendorStatusFromDb = yield vendorDatabse.findStatusForMiddleware(user.userId);
            if (!vendorStatusFromDb) {
                res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({ error: "No vendor found in this ID" });
                return;
            }
            if (vendorStatusFromDb.status !== 'active') {
                res.status(httpStatus_1.HttpStatus.FORBIDDEN).json({ message: "User blocked by admin", code: "USER_BLOCKED" });
                return;
            }
            if (vendorStatusFromDb.vendorStatus !== 'approved') {
                res.status(httpStatus_1.HttpStatus.FORBIDDEN).json({ message: "Vendor not approved by admin", code: "NOT_APPROVED" });
                return;
            }
            yield redisService.set(`user:vendor:${user.userId}`, 15 * 60, JSON.stringify({ status: vendorStatusFromDb.status, vendorStatus: vendorStatusFromDb.vendorStatus }));
        }
        next();
    });
};
exports.vendorStatusCheckingMiddleware = vendorStatusCheckingMiddleware;
