"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VendorModel = void 0;
const vendorSchema_1 = require("../schema/vendorSchema");
const mongoose_1 = require("mongoose");
exports.VendorModel = (0, mongoose_1.model)('vendors', vendorSchema_1.VendorSchema);
