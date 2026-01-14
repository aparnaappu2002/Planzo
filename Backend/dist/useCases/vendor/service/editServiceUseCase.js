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
exports.EditServiceUseCase = void 0;
class EditServiceUseCase {
    constructor(serviceDatabase) {
        this.serviceDatabase = serviceDatabase;
    }
    editService(service, serviceId) {
        return __awaiter(this, void 0, void 0, function* () {
            const updateService = yield this.serviceDatabase.editService(service, serviceId);
            if (!updateService)
                throw new Error('There is no service in this ID');
            return updateService;
        });
    }
}
exports.EditServiceUseCase = EditServiceUseCase;
