import { verifyTokenAndCheckBlackList } from "../../adapters/middlewares/tokenValidationMiddleware";
import { TokenService } from "../services/tokenService";
import {RedisService} from "../services/redisService";
import { JwtService } from "../services/jwtService";
import { clientRepository } from "../../adapters/repository/client/clientRespository";
import { VendorDatabase } from "../../adapters/repository/vendor/vendorDatabase";
import { AdminRepository } from "../../adapters/repository/admin/adminRepository";
import { tokenTimeExpiryValidationMiddleware } from "../../adapters/middlewares/tokenTimeExpiryValidation";
import { checkAdminState } from "../../adapters/middlewares/admin/checkAdmin";
import { clientStatusCheckingMiddleware } from "../../adapters/middlewares/client/ClientStatusChecking";
import { vendorStatusCheckingMiddleware } from "../../adapters/middlewares/vendor/vendorStatusChecking";
import { RefreshTokenController } from "../../adapters/controllers/auth/refreshTokenController";
import { RefreshTokenUseCase } from "../../useCases/auth/refreshTokenUseCase";
import { RefreshTokenVendorController } from "../../adapters/controllers/auth/refreshTokenVendorController";
import { RefreshTokenAdminController } from "../../adapters/controllers/auth/refreshTokenAdminController";


const redisService=new RedisService()
const jwtService=new JwtService()
const ACCESSTOKEN_SECRET_KEY = process.env.ACCESSTOKEN_SECRET_KEY
const tokenService = new TokenService(redisService,jwtService,ACCESSTOKEN_SECRET_KEY!)
export const injectedVerifyTokenAndCheckBlacklistMiddleware = verifyTokenAndCheckBlackList(tokenService)

//client refresh token
const clientDatabase = new clientRepository()
const vendorDatabase = new VendorDatabase()
const adminRepository = new AdminRepository()
const refreshTokenUseCase = new RefreshTokenUseCase(jwtService, clientDatabase, vendorDatabase, adminRepository)
export const injectedRefreshTokenController = new RefreshTokenController(refreshTokenUseCase)
//vendor refresh token
export const injectedVendorRefreshTokenController = new RefreshTokenVendorController(refreshTokenUseCase)

export const injectRefreshTokenAdminController = new RefreshTokenAdminController(refreshTokenUseCase)

export const injectedTokenExpiryValidationChecking = tokenTimeExpiryValidationMiddleware(jwtService)
export const checkAdminMiddleWare = checkAdminState(jwtService, redisService, adminRepository)


const ClientRepository = new clientRepository()
export const injectedClientStatusCheckingMiddleware = clientStatusCheckingMiddleware(redisService, ClientRepository)


export const injectedVendorStatusCheckingMiddleware = vendorStatusCheckingMiddleware(redisService, vendorDatabase)