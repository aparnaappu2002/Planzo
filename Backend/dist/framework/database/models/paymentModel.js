"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentModel = void 0;
const mongoose_1 = require("mongoose");
const paymentSchema_1 = require("../schema/paymentSchema");
exports.paymentModel = (0, mongoose_1.model)('payment', paymentSchema_1.paymentSchema);
