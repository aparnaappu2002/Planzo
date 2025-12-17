import { NextFunction, Request, Response } from "express";
import { IredisService } from "../../../domain/interfaces/serviceInterface/IredisService";
import { IClientDatabaseRepository } from "../../../domain/interfaces/repositoryInterfaces/client/clientDatabaseRepository";
import { HttpStatus } from "../../../domain/enums/httpStatus";

export const clientStatusCheckingMiddleware = (redisService: IredisService, clientDatabase: IClientDatabaseRepository) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        const user = (req as any).user
        let status = await redisService.get(`user:${user.userId}:${user.role}`)
        console.log('status of user',status)
        if (!status) {
            status = await clientDatabase.findStatusForMiddleware(user.userId)
            await redisService.set(`user:${user.userId}:${user.role}`, 15 * 60, JSON.stringify(status))
        }
        if (status === '"block"') {
            res.status(HttpStatus.FORBIDDEN).json({ message: "User blocked by admin", code: "USER_BLOCKED" })
            return
        }
        next()
    }
}