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
exports.WorkSampleRepository = void 0;
const mongoose_1 = require("mongoose");
const workSampleModel_1 = require("../../../framework/database/models/workSampleModel");
class WorkSampleRepository {
    createWorkSamples(workSample) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield workSampleModel_1.workSampleModel.create(workSample);
        });
    }
    findWorkSample(vendorId, pageNo) {
        return __awaiter(this, void 0, void 0, function* () {
            const page = Math.max(pageNo, 1);
            const limit = 3;
            const skip = (page - 1) * limit;
            const workSamples = yield workSampleModel_1.workSampleModel.find({ vendorId }).skip(skip).limit(limit).sort({ createdAt: -1 });
            const totalPages = Math.ceil((yield workSampleModel_1.workSampleModel.countDocuments({ vendorId: new mongoose_1.Types.ObjectId(vendorId) })) / limit) || 1;
            return { workSamples, totalPages };
        });
    }
    vendorProfileWithWorkSample(vendorId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield workSampleModel_1.workSampleModel.find({ vendorId }).populate('vendorId', '_id name profileImage').lean();
        });
    }
}
exports.WorkSampleRepository = WorkSampleRepository;
