"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serviceModal = void 0;
const serviceSchema_1 = require("../schema/serviceSchema");
const mongoose_1 = require("mongoose");
exports.serviceModal = (0, mongoose_1.model)("service", serviceSchema_1.serviceSchema);
