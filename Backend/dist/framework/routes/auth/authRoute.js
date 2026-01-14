"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthRoute = void 0;
const express_1 = require("express");
const serviceInject_1 = require("../../inject/serviceInject");
const serviceInject_2 = require("../../inject/serviceInject");
class AuthRoute {
    constructor() {
        this.AuthRouter = (0, express_1.Router)();
        this.setRoute();
    }
    setRoute() {
        this.AuthRouter.post('/refreshToken', (req, res) => {
            serviceInject_1.injectedRefreshTokenController.handleRefreshToken(req, res);
        });
        this.AuthRouter.post('/client/refreshToken', (req, res) => {
            serviceInject_1.injectedRefreshTokenController.handleRefreshToken(req, res);
        });
        this.AuthRouter.post('/vendor/refreshToken', (req, res) => {
            serviceInject_2.injectedVendorRefreshTokenController.handleRefreshToken(req, res);
        });
    }
}
exports.AuthRoute = AuthRoute;
