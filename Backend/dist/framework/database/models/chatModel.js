"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatModel = void 0;
const mongoose_1 = require("mongoose");
const chatSchema_1 = require("../schema/chatSchema");
exports.chatModel = (0, mongoose_1.model)('chat', chatSchema_1.chatSchema);
