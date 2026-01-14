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
exports.ServiceWithVendorUseCase = void 0;
class ServiceWithVendorUseCase {
    constructor(serviceDatabase, reviewDatabase) {
        this.serviceDatabase = serviceDatabase;
        this.reviewDatabase = reviewDatabase;
    }
    showServiceWithVendorUseCase(serviceId, pageNo, rating) {
        return __awaiter(this, void 0, void 0, function* () {
            const serviceWithVendor = yield this.serviceDatabase.showServiceDataInBookingPage(serviceId);
            if (!serviceWithVendor)
                throw new Error('No service found in this service ID');
            const { reviews, totalPages } = yield this.reviewDatabase.findReviews(serviceId, pageNo, rating);
            return { service: serviceWithVendor, reviews, totalPages };
        });
    }
}
exports.ServiceWithVendorUseCase = ServiceWithVendorUseCase;
