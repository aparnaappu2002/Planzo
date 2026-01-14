"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationModal = void 0;
const mongoose_1 = require("mongoose");
const notificationSchema_1 = require("../schema/notificationSchema");
exports.notificationModal = (0, mongoose_1.model)('notification', notificationSchema_1.notificationSchema);
