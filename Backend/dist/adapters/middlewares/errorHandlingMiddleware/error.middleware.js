"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const messages_1 = require("../../../domain/enums/messages");
const httpStatus_1 = require("../../../domain/enums/httpStatus");
const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || httpStatus_1.HttpStatus.INTERNAL_SERVER_ERROR;
    const message = err.message || messages_1.Messages.SERVER_ERROR;
    res.status(statusCode).json({ success: false, statusCode, message });
};
exports.errorHandler = errorHandler;
