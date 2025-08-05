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
import { ForgotPasswordClient } from "../../adapters/controllers/client/authentication/forgotPasswordClientController";
import { ResetPasswordClientUseCase } from "../../useCases/client/authentication/forgotPasswordUseCase";
import { VendorDatabase } from "../../adapters/repository/vendor/vendorDatabase";
import { GoogleLoginClientUseCase } from "../../useCases/client/authentication/googleLoginClientUseCase";
import { ProfileClientController } from "../../adapters/controllers/client/profile/changePasswordClientController";
import { ChangePasswordClientUseCase } from "../../useCases/client/profile/changePasswordClientUseCase";
import { hashPassword } from "../hashpassword/hashPassword";
import { ChangeProfileImageClientUseCase } from "../../useCases/client/profile/changeProfileImageUseCase";
import { ChangeProfileImageClientController } from "../../adapters/controllers/client/profile/changeProfileImageClientController";
import { ShowProfileDetailsInClientUseCase } from "../../useCases/client/profile/showProfileDetailsClientsUseCase";
import { ShowProfileClientController } from "../../adapters/controllers/client/profile/showProfileClientController";
import { UpdateProfileClientUseCase } from "../../useCases/client/profile/updateProfileDataClientUseCase";
import { UpdateProfileClientController } from "../../adapters/controllers/client/profile/updateProfileClientController";

const otpService=new OtpService()
const EmailService=new emailService()
const ClientRepository=new clientRepository()
const VendorRepository=new VendorDatabase()
const HashPassword = new hashPassword()

const UserExistence=new userExistence(ClientRepository,VendorRepository)
const SendOtpClientUseCase=new sendOtpClientUseCase(otpService,EmailService,UserExistence)
const createClientUseCase= new CreateClientUseCase(ClientRepository)
export const clientAuthenticationController=new ClientAuthenticationController(createClientUseCase,SendOtpClientUseCase)

const jwtService = new JwtService()
const redisService=new RedisService()
const loginclientUseCase=new LoginClientUseCase(ClientRepository)
const googleLoginClientUseCase = new GoogleLoginClientUseCase(ClientRepository)
export const injectedClientLoginController = new ClientLoginController(loginclientUseCase,jwtService,redisService,googleLoginClientUseCase)


//forgot password client
const SendMailForgetPasswordClient=new sendMailForgetPasswordClient(EmailService,jwtService,ClientRepository)
const forgotPasswordClientUseCase = new ResetPasswordClientUseCase(jwtService,ClientRepository)
export const injectedForgotPasswordClientController = new ForgotPasswordClient(SendMailForgetPasswordClient,forgotPasswordClientUseCase)

//change password
const changePasswordClientUseCase = new ChangePasswordClientUseCase(ClientRepository,HashPassword)
const changeProfileImageClientUseCase = new ChangeProfileImageClientUseCase(ClientRepository)
const showProfileDetailsClientUseCase=new ShowProfileDetailsInClientUseCase(ClientRepository)
const updateProfileClientUseCase = new UpdateProfileClientUseCase(ClientRepository)
export const injectedProfileClientController =  new ProfileClientController(changePasswordClientUseCase,changeProfileImageClientUseCase,showProfileDetailsClientUseCase,updateProfileClientUseCase)






