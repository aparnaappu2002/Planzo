import { AdminRepository } from "../../adapters/repository/admin/adminRepository";
import { AdminLoginController } from "../../adapters/controllers/admin/authentication/adminLoginController";
import { AdminLoginUseCase } from "../../useCases/admin/authentication/adminLoginUseCase";
import { JwtService } from "../services/jwtService";
import { RedisService } from "../services/redisService";



const adminRepository=new AdminRepository()
const adminLoginUseCase=new AdminLoginUseCase(adminRepository)
const jwtService=new JwtService()
const redisService=new RedisService()
export const injectedAdminLoginController = new AdminLoginController(adminLoginUseCase,jwtService,redisService)
