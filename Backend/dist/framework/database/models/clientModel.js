"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientModel = void 0;
const clientSchema_1 = require("../schema/clientSchema");
const mongoose_1 = require("mongoose");
exports.ClientModel = (0, mongoose_1.model)("client", clientSchema_1.clientSchema);
