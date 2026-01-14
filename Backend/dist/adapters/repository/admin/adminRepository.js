"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminRepository = void 0;
const clientModel_1 = require("../../../framework/database/models/clientModel");
class AdminRepository {
    findByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield clientModel_1.ClientModel.findOne({ email });
        });
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield clientModel_1.ClientModel.findById(id);
        });
    }
    findState(id) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const client = yield clientModel_1.ClientModel.findById(id).select('isAdmin');
            return (_a = client === null || client === void 0 ? void 0 : client.isAdmin) !== null && _a !== void 0 ? _a : null;
        });
    }
}
exports.AdminRepository = AdminRepository;
