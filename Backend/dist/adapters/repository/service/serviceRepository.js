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
exports.ServiceRepository = void 0;
const serviceModel_1 = require("../../../framework/database/models/serviceModel");
const mongoose_1 = require("mongoose");
class ServiceRepository {
    createService(service) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield serviceModel_1.serviceModal.create(service);
        });
    }
    findServiceOfAVendor(vendorId, pageNo) {
        return __awaiter(this, void 0, void 0, function* () {
            const limit = 1;
            const page = Math.max(pageNo, 1);
            const skip = (page - 1) * limit;
            const Services = yield serviceModel_1.serviceModal.find({ vendorId }).sort({ createdAt: -1 }).skip(skip).limit(limit);
            const totalPages = Math.ceil((yield serviceModel_1.serviceModal.countDocuments({ vendorId: new mongoose_1.Types.ObjectId(vendorId) })) / limit);
            return { Services, totalPages };
        });
    }
    editService(service, serviceId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield serviceModel_1.serviceModal.findByIdAndUpdate(serviceId, service, { new: true });
        });
    }
    findServiceById(serviceId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield serviceModel_1.serviceModal.findById(serviceId);
        });
    }
    changeStatus(serviceId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield serviceModel_1.serviceModal.findOneAndUpdate({ _id: serviceId }, [
                {
                    $set: {
                        status: {
                            $cond: {
                                if: { $eq: ["$status", "active"] },
                                then: "blocked",
                                else: "active"
                            }
                        }
                    }
                }
            ], { new: true });
        });
    }
    findServiceForClient(pageNo) {
        return __awaiter(this, void 0, void 0, function* () {
            const limit = 6;
            const page = Math.max(pageNo, 1);
            const skip = (page - 1) * limit;
            const Services = yield serviceModel_1.serviceModal.find({ status: 'active' }).select('-createdAt -updatedAt').skip(skip).limit(limit);
            const totalPages = Math.ceil((yield serviceModel_1.serviceModal.countDocuments({ status: 'active' })) / limit);
            return { Services, totalPages };
        });
    }
    showServiceDataInBookingPage(serviceId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e;
            const service = yield serviceModel_1.serviceModal.findOne({ _id: serviceId, status: 'active' })
                .populate({
                path: 'vendorId',
                match: { status: 'active' },
                select: 'name email phone profileImage'
            });
            if (!service || !service.vendorId)
                throw new Error('Service or active vendor not found');
            const serviceWithVendor = {
                _id: service === null || service === void 0 ? void 0 : service._id,
                price: service === null || service === void 0 ? void 0 : service.servicePrice,
                serviceDescription: service === null || service === void 0 ? void 0 : service.serviceDescription,
                serviceTitle: service === null || service === void 0 ? void 0 : service.serviceTitle,
                duration: service === null || service === void 0 ? void 0 : service.serviceDuration,
                vendor: {
                    _id: (_a = service === null || service === void 0 ? void 0 : service.vendorId) === null || _a === void 0 ? void 0 : _a._id,
                    email: (_b = service === null || service === void 0 ? void 0 : service.vendorId) === null || _b === void 0 ? void 0 : _b.email,
                    name: (_c = service === null || service === void 0 ? void 0 : service.vendorId) === null || _c === void 0 ? void 0 : _c.name,
                    phone: (_d = service === null || service === void 0 ? void 0 : service.vendorId) === null || _d === void 0 ? void 0 : _d.phone,
                    profileImage: (_e = service === null || service === void 0 ? void 0 : service.vendorId) === null || _e === void 0 ? void 0 : _e.profileImage
                }
            };
            // console.log('service',serviceWithVendor)
            return serviceWithVendor;
        });
    }
    findServiceByCategory(categoryId, pageNo, sortBy) {
        return __awaiter(this, void 0, void 0, function* () {
            const page = Math.max(pageNo, 1);
            const limit = 6;
            const skip = (page - 1) * limit;
            const sortOptions = {
                "a-z": { serviceTitle: 1 },
                "z-a": { serviceTitle: -1 },
                "price-low-high": { servicePrice: 1 },
                "price-high-low": { servicePrice: -1 },
                "newest": { createdAt: -1 },
                "oldest": { createdAt: 1 }
            };
            const sort = sortOptions[sortBy] || { createdAt: -1 };
            const filter = { status: 'active' };
            if (categoryId)
                filter.categoryId = categoryId;
            const Services = yield serviceModel_1.serviceModal.find(filter).collation({ locale: 'en', strength: 2 }).select('-createdAt -updatedAt').skip(skip).limit(limit).sort(sort);
            const totalPages = Math.ceil((yield serviceModel_1.serviceModal.countDocuments(filter)) / limit);
            console.log(totalPages);
            return { Services, totalPages };
        });
    }
    searchService(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const regex = new RegExp(query || '', 'i');
            return yield serviceModel_1.serviceModal.find({ serviceTitle: { $regex: regex }, status: 'active' }).select('_id serviceTitle ');
        });
    }
}
exports.ServiceRepository = ServiceRepository;
