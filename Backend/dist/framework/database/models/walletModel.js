"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.walletModel = void 0;
const mongoose_1 = require("mongoose");
const walletSchema_1 = require("../schema/walletSchema");
exports.walletModel = (0, mongoose_1.model)('wallet', walletSchema_1.walletSchema);
