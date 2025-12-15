import { Request, Response, Router } from "express";
import { injectedRefreshTokenController } from "../../inject/serviceInject";
import { injectedVendorRefreshTokenController } from "../../inject/serviceInject";

export class AuthRoute {
    public AuthRouter: Router
    constructor() {
        this.AuthRouter = Router()
        this.setRoute()
    }
    private setRoute() {
        this.AuthRouter.post('/refreshToken', (req: Request, res: Response) => {
            injectedRefreshTokenController.handleRefreshToken(req, res)
        })
        this.AuthRouter.post('/client/refreshToken', (req: Request, res: Response) => {
            injectedRefreshTokenController.handleRefreshToken(req, res)
        })
        this.AuthRouter.post('/vendor/refreshToken', (req: Request, res: Response) => {
            injectedVendorRefreshTokenController.handleRefreshToken(req, res)
        })
    }
}