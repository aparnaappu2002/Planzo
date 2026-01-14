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
exports.checkAdminState = void 0;
const httpStatus_1 = require("../../../domain/enums/httpStatus");
const checkAdminState = (jwtService, redisService, adminDatabase) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const status = yield redisService.get('adminRole');
        const user = req.user;
        const userId = user.userId;
        if (status && status !== 'true') {
            res.status(httpStatus_1.HttpStatus.FORBIDDEN).json({ error: "UnAuthorized" });
            return;
        }
        if (!status) {
            const status = yield adminDatabase.findState(userId);
            if (status !== true) {
                res.status(httpStatus_1.HttpStatus.FORBIDDEN).json({ error: "UnAuthorized" });
                return;
            }
            yield redisService.set('adminRole', 15 * 60, `${status}`);
        }
        next();
    });
};
exports.checkAdminState = checkAdminState;
