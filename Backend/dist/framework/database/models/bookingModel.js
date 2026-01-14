"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bookingModel = void 0;
const mongoose_1 = require("mongoose");
const bookingSchema_1 = require("../schema/bookingSchema");
exports.bookingModel = (0, mongoose_1.model)("bookings", bookingSchema_1.bookingSchema);
