"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reviewModel = void 0;
const mongoose_1 = require("mongoose");
const reviewSchema_1 = require("../schema/reviewSchema");
exports.reviewModel = (0, mongoose_1.model)('review', reviewSchema_1.reviewSchema);
