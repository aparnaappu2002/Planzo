"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkRoleBaseMiddleware = void 0;
const httpStatus_1 = require("../../domain/enums/httpStatus");
const checkRoleBaseMiddleware = (...allowedRoles) => {
    return (req, res, next) => {
        const user = req.user;
        if (!user || !allowedRoles.includes(user.role)) {
            res.status(httpStatus_1.HttpStatus.FORBIDDEN).json({ error: "Access Denied:UnAuthorized role" });
            return;
        }
        next();
    };
};
exports.checkRoleBaseMiddleware = checkRoleBaseMiddleware;
