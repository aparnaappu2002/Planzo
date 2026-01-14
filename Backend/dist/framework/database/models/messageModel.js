"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.messageModel = void 0;
const mongoose_1 = require("mongoose");
const messageSchema_1 = require("../schema/messageSchema");
exports.messageModel = (0, mongoose_1.model)('message', messageSchema_1.messageSchema);
