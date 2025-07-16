import { OtpService } from "../services/otpService";
import { emailService } from "../services/emailService";
import { clientRepository } from "../../adapters/repository/client/clientRespository";
import { userExistence } from "../services/userExistenceChecking";
import { sendOtpClientUseCase} from "../../useCases/client/authentication/sendOtpClientUseCase";
import { CreateClientUseCase } from "../../useCases/client/authentication/createClientUsecase";
import { ClientAuthenticationController } from "../../adapters/controllers/client/authentication/clientAuthenticationController";
import { JwtService } from "../services/jwtService";
import { RedisService } from "../services/redisService";
import { LoginClientUseCase } from "../../useCases/client/authentication/clientLoginUseCase";
import { ClientLoginController } from "../../adapters/controllers/client/authentication/clientLoginController";
import { sendMailForgetPasswordClient } from "../../useCases/client/authentication/sendMailForgetPassword";
import { sendResetEmailToClient } from "../../adapters/controllers/client/authentication/sendResetEmailClient";
import { ResetForgtoPasswordClient } from "../../adapters/controllers/client/authentication/resetForgotPassword";
import { ResetPasswordClientUseCase } from "../../useCases/client/authentication/forgotPasswordUseCase";
const otpService=new OtpService()
const EmailService=new emailService()
const ClientRepository=new clientRepository()
const UserExistence=new userExistence(ClientRepository)
const SendOtpClientUseCase=new sendOtpClientUseCase(otpService,EmailService,UserExistence)
const createClientUseCase= new CreateClientUseCase(ClientRepository)
export const clientAuthenticationController=new ClientAuthenticationController(createClientUseCase,SendOtpClientUseCase)

const jwtService = new JwtService()
const redisService=new RedisService()
const loginclientUseCase=new LoginClientUseCase(ClientRepository)
export const injectedClientLoginController = new ClientLoginController(loginclientUseCase,jwtService,redisService)


//send mail for forgot password
const SendMailForgetPasswordClient=new sendMailForgetPasswordClient(EmailService,jwtService,ClientRepository)
export const injectedSendMailForgetPasswordController = new sendResetEmailToClient(SendMailForgetPasswordClient)

//change password for forgot password
const forgotPasswordClientUseCase = new ResetPasswordClientUseCase(jwtService,ClientRepository)
export const injectedForgotPasswordClientController = new ResetForgtoPasswordClient(forgotPasswordClientUseCase)