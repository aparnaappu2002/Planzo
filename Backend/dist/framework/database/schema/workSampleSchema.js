"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.workSampleSchema = void 0;
const mongoose_1 = require("mongoose");
exports.workSampleSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    images: {
        type: [String],
        required: true
    },
    vendorId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'vendors',
        required: true
    }
}, {
    timestamps: true
});
