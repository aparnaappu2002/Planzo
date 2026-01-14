"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventModal = void 0;
const mongoose_1 = require("mongoose");
const eventSchema_1 = require("../schema/eventSchema");
exports.eventModal = (0, mongoose_1.model)('event', eventSchema_1.eventSchema);
