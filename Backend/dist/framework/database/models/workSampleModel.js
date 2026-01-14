"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.workSampleModel = void 0;
const mongoose_1 = require("mongoose");
const workSampleSchema_1 = require("../schema/workSampleSchema");
exports.workSampleModel = (0, mongoose_1.model)('workSample', workSampleSchema_1.workSampleSchema);
