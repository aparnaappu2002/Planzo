import { Request, Response } from "express";
import { IchangePasswordClientUseCase } from "../../../../domain/interfaces/useCaseInterfaces/client/profile/IchangePasswordClient";
import { HttpStatus } from "../../../../domain/enums/httpStatus";
import { IchangeProfileImageClientUseCase } from "../../../../domain/interfaces/useCaseInterfaces/client/profile/IchangeProfileImage";
import { IshowProfileClientUseCase } from "../../../../domain/interfaces/useCaseInterfaces/client/profile/IshowProfileClient";
import { IupdateProfileDataUseCase } from "../../../../domain/interfaces/useCaseInterfaces/client/profile/IupdateProfileClient";
import { Messages } from "../../../../domain/enums/messages";

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
    async handeChangePasswordClient(req: Request, res: Response): Promise<void> {
        try {
            const { userId, oldPassword, newPassword } = req.body
            console.log(userId)
            const changePasswordClient = await this.changePasswordCientUseCase.changePasswordClient(userId, oldPassword, newPassword)
            res.status(HttpStatus.OK).json({ message: Messages.PASSWORD_CHANGED, changePasswordClient })
        } catch (error) {
            console.log('error while changing the password of the client', error)
            res.status(HttpStatus.BAD_REQUEST).json({
                message: Messages.PASSWORD_CHANGE_ERROR,
                error: error instanceof Error ? error.message : Messages.PASSWORD_CHANGE_ERROR
            })
        }
    }
    async handleUpdateProfileImageClient(req: Request, res: Response): Promise<void> {
        try {
            const { clientId, profileImage } = req.body
            const updatedProfile = await this.changeProfileImageClientUseCase.changeProfileImage(clientId, profileImage)
            res.status(HttpStatus.OK).json({ message: Messages.PROFILE_IMAGE_UPDATED, updatedProfile })
        } catch (error) {
            console.log('error while changing profie image client', error)
            res.status(HttpStatus.BAD_REQUEST).json({
                message: Messages.PROFILE_IMAGE_UPDATE_ERROR,
                error: error instanceof Error ? error.message : Messages.PROFILE_IMAGE_UPDATE_ERROR
            })
        }
    }
    async handleShowProfileClient(req: Request, res: Response): Promise<void> {
        try {
            const { clientId } = req.params
            const client = await this.showProfileClientUseCase.showProfile(clientId)
            res.status(HttpStatus.OK).json({ message: Messages.PROFILE_FETCHED, client })
        } catch (error) {
            console.log('error while fetching profile details of client', error)
            res.status(HttpStatus.BAD_REQUEST).json({
                message: Messages.PROFILE_FETCH_ERROR,
                error: error instanceof Error ? error.message : Messages.PROFILE_FETCH_ERROR
            })
        }
    }
    async handleUpdateProfileClient(req: Request, res: Response): Promise<void> {
        try {
            const { client } = req.body
            const updatedProfile = await this.updateProfileClientUseCase.updateClientProfile(client)
            if (!updatedProfile) {
                res.status(HttpStatus.BAD_REQUEST).json({ error: Messages.USER_NOT_FOUND })
                return
            }
            res.status(HttpStatus.OK).json({ message: Messages.PROFILE_UPDATED, updatedProfile })
        } catch (error) {
            console.log('error while update client profile', error)
            res.status(HttpStatus.BAD_REQUEST).json({
                message: Messages.PROFILE_UPDATE_ERROR,
                error: error instanceof Error ? error.message : Messages.PROFILE_UPDATE_ERROR
            })
        }
    }
}