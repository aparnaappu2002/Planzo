import { Request, Response } from "express";
import { IrefreshTokenUseCase } from "../../../domain/interfaces/useCaseInterfaces/auth/IrefreshTokenUseCase";
import { HttpStatus } from "../../../domain/enums/httpStatus";
import { Messages } from "../../../domain/enums/messages";

export class RefreshTokenVendorController {
    private refreshTokenUseCase: IrefreshTokenUseCase
    constructor(refreshTokenUseCase: IrefreshTokenUseCase) {
        this.refreshTokenUseCase = refreshTokenUseCase
    }
    async handleRefreshToken(req: Request, res: Response): Promise<void> {
        try {
            const refreshToken = req.cookies.vendor_refresh
            if (!refreshToken) {
                res.status(HttpStatus.BAD_REQUEST).json({ error: Messages.TOKEN_NOT_FOUND })
                return
            }
            const newAccessToken = await this.refreshTokenUseCase.execute(refreshToken)
            res.status(HttpStatus.OK).json({message:Messages.TOKEN_CREATED,newAccessToken})
        } catch (error) {
            console.log('error while handling refresh Token', error)
            res.status(HttpStatus.BAD_REQUEST).json({
                message: Messages.TOKEN_REFRESH_ERROR,
                error: error instanceof Error ? error.message : Messages.TOKEN_REFRESH_ERROR
            })
        }
    }
}