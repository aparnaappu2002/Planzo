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
exports.VendorDatabase = void 0;
const vendorModel_1 = require("../../../framework/database/models/vendorModel");
class VendorDatabase {
    createVendor(vendor) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield vendorModel_1.VendorModel.create(vendor);
        });
    }
    findByEmaill(email) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield vendorModel_1.VendorModel.findOne({ email: email });
        });
    }
    resetPassword(vendorId, password) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield vendorModel_1.VendorModel.findOneAndUpdate({ vendorId }, { password }, { new: true });
        });
    }
    findAllVendors(pageNo) {
        return __awaiter(this, void 0, void 0, function* () {
            const limit = 5;
            const page = Math.max(1, pageNo);
            const skip = (page - 1) * limit;
            const Vendors = yield vendorModel_1.VendorModel.find({ vendorStatus: 'approved' }).select('-password').skip(skip).limit(limit);
            const totalPages = Math.ceil((yield vendorModel_1.VendorModel.countDocuments({ vendorStatus: 'approved' })) / limit);
            return { Vendors, totalPages };
        });
    }
    blockVendor(vendorId) {
        return __awaiter(this, void 0, void 0, function* () {
            const blockedVendor = yield vendorModel_1.VendorModel.findByIdAndUpdate(vendorId, { status: 'block' }).select('status');
            return (blockedVendor === null || blockedVendor === void 0 ? void 0 : blockedVendor.status) || null;
        });
    }
    unblockVendor(vendorId) {
        return __awaiter(this, void 0, void 0, function* () {
            const unblockVendor = yield vendorModel_1.VendorModel.findByIdAndUpdate(vendorId, { status: 'active' }).select('status');
            return (unblockVendor === null || unblockVendor === void 0 ? void 0 : unblockVendor.status) || null;
        });
    }
    findAllPendingVendors(pageNo) {
        return __awaiter(this, void 0, void 0, function* () {
            const limit = 5;
            const page = Math.max(1, pageNo);
            const skip = (page - 1) * limit;
            const pendingVendors = yield vendorModel_1.VendorModel.find({ vendorStatus: 'pending' }).select('-password').skip(skip).limit(limit);
            const totalPages = Math.ceil((yield vendorModel_1.VendorModel.countDocuments({ vendorStatus: 'approved' })) / limit);
            return { pendingVendors, totalPages };
        });
    }
    findById(vendorId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield vendorModel_1.VendorModel.findById(vendorId);
        });
    }
    rejectPendingVendor(vendorId, newStatus, rejectionReason) {
        return __awaiter(this, void 0, void 0, function* () {
            const vendor = yield vendorModel_1.VendorModel.findByIdAndUpdate(vendorId, { vendorStatus: newStatus, rejectionReason }, { new: true });
            if (!vendor)
                throw new Error('There is no vendor in this email');
            return vendor;
        });
    }
    changeVendorStatus(vendorId, newStatus) {
        return __awaiter(this, void 0, void 0, function* () {
            const vendor = yield vendorModel_1.VendorModel.findByIdAndUpdate(vendorId, { vendorStatus: newStatus }, { new: true });
            if (!vendor)
                throw new Error('There is no vendor in this email');
            return vendor;
        });
    }
    updateDetailsVendor(vendorId, about, phone, name) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield vendorModel_1.VendorModel.findByIdAndUpdate(vendorId, { aboutVendor: about, phone, name }).select('_id email name phone role status vendorId vendorStatus profileImage aboutVendor role');
        });
    }
    changePassword(vendorId, newPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            const changedPasswordVendor = yield vendorModel_1.VendorModel.findByIdAndUpdate(vendorId, { password: newPassword });
            if (!changedPasswordVendor)
                return false;
            return true;
        });
    }
    findPassword(vendorId) {
        return __awaiter(this, void 0, void 0, function* () {
            const oldPassword = yield vendorModel_1.VendorModel.findById(vendorId).select('password');
            return (oldPassword === null || oldPassword === void 0 ? void 0 : oldPassword.password) || null;
        });
    }
    findStatusForMiddleware(vendorId) {
        return __awaiter(this, void 0, void 0, function* () {
            const status = yield vendorModel_1.VendorModel.findById(vendorId).select('status vendorStatus');
            if (!status)
                return null;
            return { status: status === null || status === void 0 ? void 0 : status.status, vendorStatus: status === null || status === void 0 ? void 0 : status.vendorStatus };
        });
    }
    searchVendors(search) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = { role: "vendor" };
            if (search) {
                const orConditions = [
                    { name: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } },
                    { vendorId: { $regex: search, $options: 'i' } }
                ];
                const phoneNumber = parseInt(search, 10);
                if (!isNaN(phoneNumber)) {
                    orConditions.push({ phone: phoneNumber });
                }
                orConditions.push({
                    $expr: {
                        $regexMatch: {
                            input: { $toString: "$phone" },
                            regex: search,
                            options: "i"
                        }
                    }
                });
                query.$or = orConditions;
            }
            const vendors = yield vendorModel_1.VendorModel.find(query)
                .select('-password');
            return vendors;
        });
    }
    findVendorsForCarousal() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield vendorModel_1.VendorModel.find({ status: 'active', vendorStatus: 'approved' }).select('name profileImage idProof');
        });
    }
    findTotalVendor() {
        return __awaiter(this, void 0, void 0, function* () {
            return vendorModel_1.VendorModel.countDocuments({ vendorStatus: 'approved' });
        });
    }
}
exports.VendorDatabase = VendorDatabase;
