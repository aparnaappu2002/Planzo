import { emailService } from "../services/emailService";
import { OtpService } from "../services/otpService";
import { VendorDatabase } from "../../adapters/repository/vendor/vendorDatabase";
import { clientRepository } from "../../adapters/repository/client/clientRespository";
import { userExistence } from "../services/userExistenceChecking";
import { SendOtpVendorUseCase } from "../../useCases/vendor/authentication/sendOtpVendorUseCase";
import { VendorAuthenticationController } from "../../adapters/controllers/vendor/authentication/registerVendor";
import { JwtService } from "../services/jwtService";
import { RedisService } from "../services/redisService";
import { VendorRegisterUseCase } from "../../useCases/vendor/authentication/vendorRegisterUseCase";
import { LoginVendorUseCase } from "../../useCases/vendor/authentication/loginVendorUseCase";
import { LoginVendorController } from "../../adapters/controllers/vendor/authentication/loginVendor";
import { sendEmailForgetPasswordVendor } from "../../useCases/vendor/authentication/sendEmailForgetPasswordVendor";
import { sendEmailForgetPasswordVendorController } from "../../adapters/controllers/vendor/authentication/sendEmailForgetPasswordVendor";
import { ResetPasswordVendorController } from "../../adapters/controllers/vendor/authentication/resetPasswordVendorController";
import { ResetPasswordVendorUseCase } from "../../useCases/vendor/authentication/forgotPasswordVendorUseCase";
import { ResendOtpVendorController } from "../../adapters/controllers/vendor/authentication/resendOtpController";
import { ResendOtpVendorUseCase } from "../../useCases/vendor/authentication/resendOtpVendorUseCase";



const EmailService  = new emailService()
const otpService = new OtpService()
const vendorRepository = new VendorDatabase()
const clientDatabase = new clientRepository()
const UserExistence = new userExistence(clientDatabase,vendorRepository)

const injectedVendorRegisterUsecase=new VendorRegisterUseCase(vendorRepository)
const sendOtpVendorUseCase=new SendOtpVendorUseCase(EmailService,otpService,UserExistence)
export const injectedVendorAuthenticationController=new VendorAuthenticationController(injectedVendorRegisterUsecase,sendOtpVendorUseCase)

//login vendor
const vendorLoginUseCase=new LoginVendorUseCase(vendorRepository)
const jwtService=new JwtService()
const redisService=new RedisService()
export const injectedVendorLoginController=new LoginVendorController(vendorLoginUseCase,jwtService,redisService)

//resend otp
const resendOtpVendorUseCase = new ResendOtpVendorUseCase(EmailService,otpService)
export const injectedResendOtpVendorController = new ResendOtpVendorController(resendOtpVendorUseCase)

//send mail for forgot password
const SendEmailForgetPasswordVendor=new sendEmailForgetPasswordVendor(EmailService,jwtService,vendorRepository)
export const injectedSendEmailForgetPasswordVendorController = new sendEmailForgetPasswordVendorController(SendEmailForgetPasswordVendor)

//change password for forgot password
const forgotPasswordVendorUseCase=new ResetPasswordVendorUseCase(jwtService,vendorRepository)
export const injectedForgotPasswordVendorController=new ResetPasswordVendorController(forgotPasswordVendorUseCase)


