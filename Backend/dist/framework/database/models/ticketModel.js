"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ticketModel = void 0;
const mongoose_1 = require("mongoose");
const ticketSchema_1 = require("../schema/ticketSchema");
exports.ticketModel = (0, mongoose_1.model)('ticket', ticketSchema_1.ticketSchema);
