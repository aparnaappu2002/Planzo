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
exports.ProfileClientController = void 0;
const httpStatus_1 = require("../../../../domain/enums/httpStatus");
const messages_1 = require("../../../../domain/enums/messages");
class ProfileClientController {
    constructor(changePasswordCientUseCase, changeProfileImageClientUseCase, showProfileClientUseCase, updateProfileClientUseCase) {
        this.changePasswordCientUseCase = changePasswordCientUseCase;
        this.changeProfileImageClientUseCase = changeProfileImageClientUseCase;
        this.showProfileClientUseCase = showProfileClientUseCase;
        this.updateProfileClientUseCase = updateProfileClientUseCase;
    }
    handeChangePasswordClient(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { userId, oldPassword, newPassword } = req.body;
                console.log(userId);
                const changePasswordClient = yield this.changePasswordCientUseCase.changePasswordClient(userId, oldPassword, newPassword);
                res.status(httpStatus_1.HttpStatus.OK).json({ message: messages_1.Messages.PASSWORD_CHANGED, changePasswordClient });
            }
            catch (error) {
                console.log('error while changing the password of the client', error);
                res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({
                    message: messages_1.Messages.PASSWORD_CHANGE_ERROR,
                    error: error instanceof Error ? error.message : messages_1.Messages.PASSWORD_CHANGE_ERROR
                });
            }
        });
    }
    handleUpdateProfileImageClient(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { clientId, profileImage } = req.body;
                const updatedProfile = yield this.changeProfileImageClientUseCase.changeProfileImage(clientId, profileImage);
                res.status(httpStatus_1.HttpStatus.OK).json({ message: messages_1.Messages.PROFILE_IMAGE_UPDATED, updatedProfile });
            }
            catch (error) {
                console.log('error while changing profie image client', error);
                res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({
                    message: messages_1.Messages.PROFILE_IMAGE_UPDATE_ERROR,
                    error: error instanceof Error ? error.message : messages_1.Messages.PROFILE_IMAGE_UPDATE_ERROR
                });
            }
        });
    }
    handleShowProfileClient(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { clientId } = req.params;
                const client = yield this.showProfileClientUseCase.showProfile(clientId);
                res.status(httpStatus_1.HttpStatus.OK).json({ message: messages_1.Messages.PROFILE_FETCHED, client });
            }
            catch (error) {
                console.log('error while fetching profile details of client', error);
                res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({
                    message: messages_1.Messages.PROFILE_FETCH_ERROR,
                    error: error instanceof Error ? error.message : messages_1.Messages.PROFILE_FETCH_ERROR
                });
            }
        });
    }
    handleUpdateProfileClient(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { client } = req.body;
                const updatedProfile = yield this.updateProfileClientUseCase.updateClientProfile(client);
                if (!updatedProfile) {
                    res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({ error: messages_1.Messages.USER_NOT_FOUND });
                    return;
                }
                res.status(httpStatus_1.HttpStatus.OK).json({ message: messages_1.Messages.PROFILE_UPDATED, updatedProfile });
            }
            catch (error) {
                console.log('error while update client profile', error);
                res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({
                    message: messages_1.Messages.PROFILE_UPDATE_ERROR,
                    error: error instanceof Error ? error.message : messages_1.Messages.PROFILE_UPDATE_ERROR
                });
            }
        });
    }
}
exports.ProfileClientController = ProfileClientController;
