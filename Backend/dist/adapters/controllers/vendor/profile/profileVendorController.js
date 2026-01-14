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
exports.ProfileVendorController = void 0;
const httpStatus_1 = require("../../../../domain/enums/httpStatus");
class ProfileVendorController {
    constructor(changePasswordVendorUseCase, updateDetailsVendorUseCase) {
        this.changePasswordVendorUseCase = changePasswordVendorUseCase;
        this.updateDetailsVendorUseCase = updateDetailsVendorUseCase;
    }
    handleChangePasswordVendor(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { userId, newPassword, oldPassword } = req.body;
                const changePassword = yield this.changePasswordVendorUseCase.changePasswordVendor(userId, oldPassword, newPassword);
                res.status(httpStatus_1.HttpStatus.OK).json({ message: "Password changed" });
            }
            catch (error) {
                console.log('error while changing password vendor', error);
                res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({
                    message: "error while changing password vendor",
                    error: error instanceof Error ? error.message : 'error while Changing vendor password'
                });
            }
        });
    }
    handleUpdateAboutAndPhone(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id, about, phone, name } = req.body;
                const updatedVendor = yield this.updateDetailsVendorUseCase.updateDetailsVendor(id, about, phone, name);
                res.status(httpStatus_1.HttpStatus.OK).json({ message: "About and Phone Updated", updatedVendor });
            }
            catch (error) {
                console.log('Error while updating vendor about and phone', error);
                res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({
                    message: "error while updating vendor about and phone",
                    error: error instanceof Error ? error.message : 'error whiel updating vendor about and phone'
                });
            }
        });
    }
}
exports.ProfileVendorController = ProfileVendorController;
