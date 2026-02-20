import { Request, Response } from "express";
import { IchangePasswordClientUseCase } from "../../../../domain/interfaces/useCaseInterfaces/client/profile/IchangePasswordClient";
import { HttpStatus } from "../../../../domain/enums/httpStatus";
import { IchangeProfileImageClientUseCase } from "../../../../domain/interfaces/useCaseInterfaces/client/profile/IchangeProfileImage";
import { IshowProfileClientUseCase } from "../../../../domain/interfaces/useCaseInterfaces/client/profile/IshowProfileClient";
import { IupdateProfileDataUseCase } from "../../../../domain/interfaces/useCaseInterfaces/client/profile/IupdateProfileClient";
import { Messages } from "../../../../domain/enums/messages";
import { handleErrorResponse,logInfo,logError } from "../../../../framework/services/errorHandler";

export class ProfileClientController {
    private changePasswordCientUseCase: IchangePasswordClientUseCase
    private changeProfileImageClientUseCase: IchangeProfileImageClientUseCase
    private showProfileClientUseCase: IshowProfileClientUseCase
    private updateProfileClientUseCase: IupdateProfileDataUseCase
    constructor(changePasswordCientUseCase: IchangePasswordClientUseCase,changeProfileImageClientUseCase: IchangeProfileImageClientUseCase,
        showProfileClientUseCase: IshowProfileClientUseCase,updateProfileClientUseCase: IupdateProfileDataUseCase) {
        this.changePasswordCientUseCase = changePasswordCientUseCase
        this.changeProfileImageClientUseCase=changeProfileImageClientUseCase
        this.showProfileClientUseCase=showProfileClientUseCase
        this.updateProfileClientUseCase=updateProfileClientUseCase
    }
    async handleChangePasswordClient(req: Request, res: Response): Promise<void> {
        try {
            const { userId, oldPassword, newPassword } = req.body
            if (!userId) {
                res.status(HttpStatus.BAD_REQUEST).json({
                    message: 'User ID is required'
                });
                return;
            }
            if (!oldPassword) {
                res.status(HttpStatus.BAD_REQUEST).json({
                    message: 'Old password is required'
                });
                return;
            }
            if (!newPassword) {
                res.status(HttpStatus.BAD_REQUEST).json({
                    message: 'New password is required'
                });
                return;
            }
            logInfo(`Password change attempt for user: ${userId}`);
            const changePasswordClient = await this.changePasswordCientUseCase.changePasswordClient(userId, oldPassword, newPassword)
            logInfo(`Password changed successfully for user: ${userId}`);
            res.status(HttpStatus.OK).json({ message: Messages.PASSWORD_CHANGED, changePasswordClient })
        } catch (error) {
            logError('error while changing the password of the client', error)
            handleErrorResponse(req, res, error, Messages.PASSWORD_CHANGE_ERROR);
        }
    }
    async handleUpdateProfileImageClient(req: Request, res: Response): Promise<void> {
        try {
            const { clientId, profileImage } = req.body
            logInfo(`Profile image update attempt for client: ${clientId}`);
            const updatedProfile = await this.changeProfileImageClientUseCase.changeProfileImage(clientId, profileImage)
            logInfo(`Profile image updated successfully for client: ${clientId}`);
            res.status(HttpStatus.OK).json({ message: Messages.PROFILE_IMAGE_UPDATED, updatedProfile })
        } catch (error) {
            logError("Error while changing profile image client", error);
            handleErrorResponse(req, res, error, Messages.PROFILE_IMAGE_UPDATE_ERROR);
        }
    }
    async handleShowProfileClient(req: Request, res: Response): Promise<void> {
        try {
            const { clientId } = req.params
            logInfo(`Fetching profile for client: ${clientId}`);
            const client = await this.showProfileClientUseCase.showProfile(clientId)
            logInfo(`Profile fetched successfully for client: ${clientId}`);
            res.status(HttpStatus.OK).json({ message: Messages.PROFILE_FETCHED, client })
        } catch (error) {
            logError("Error while fetching profile details of client", error);
            handleErrorResponse(req, res, error, Messages.PROFILE_FETCH_ERROR);
        }
    }
    async handleUpdateProfileClient(req: Request, res: Response): Promise<void> {
        try {
            const { client } = req.body
            logInfo(`Profile update attempt for client: ${client?.id || 'unknown'}`);
            const updatedProfile = await this.updateProfileClientUseCase.updateClientProfile(client)
            if (!updatedProfile) {
                res.status(HttpStatus.BAD_REQUEST).json({ error: Messages.USER_NOT_FOUND })
                return
            }
            logInfo(`Profile updated successfully for client: ${client?.id || 'unknown'}`)
            res.status(HttpStatus.OK).json({ message: Messages.PROFILE_UPDATED, updatedProfile })
        } catch (error) {
            logError("Error while updating client profile", error);
            handleErrorResponse(req, res, error, Messages.PROFILE_UPDATE_ERROR);
        }
    }
}