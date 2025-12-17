import { NextFunction, Request, Response } from "express";
import { IjwtInterface } from "../../../domain/interfaces/serviceInterface/IjwtService";
import { IredisService } from "../../../domain/interfaces/serviceInterface/IredisService";
import { IadminRepository } from "../../../domain/interfaces/repositoryInterfaces/admin/IadminRepositoryInterface";
import { HttpStatus } from "../../../domain/enums/httpStatus";

export const checkAdminState = (jwtService: IjwtInterface, redisService: IredisService, adminDatabase: IadminRepository) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const status = await redisService.get('adminRole')
        const user = (req as any).user
        const userId = user.userId
        if (status && status !== 'true') {
            res.status(HttpStatus.FORBIDDEN).json({ error: "UnAuthorized" })
            return
        }
        if (!status) {
            const status = await adminDatabase.findState(userId)
            if (status !== true) {
                res.status(HttpStatus.FORBIDDEN).json({ error: "UnAuthorized" })
                return
            }
            await redisService.set('adminRole', 15 * 60, `${status}`)
        }
        next()
    }
}