"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transactionModel = void 0;
const mongoose_1 = require("mongoose");
const transactionSchema_1 = require("../schema/transactionSchema");
exports.transactionModel = (0, mongoose_1.model)('transaction', transactionSchema_1.transactionSchema);
