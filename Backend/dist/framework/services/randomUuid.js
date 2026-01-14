"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRandomUuid = void 0;
const crypto_1 = require("crypto");
const generateRandomUuid = () => {
    return (0, crypto_1.randomUUID)();
};
exports.generateRandomUuid = generateRandomUuid;
