"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.categoryModel = void 0;
const mongoose_1 = require("mongoose");
const categorySchema_1 = require("../schema/categorySchema");
exports.categoryModel = (0, mongoose_1.model)('category', categorySchema_1.categorySchema);
