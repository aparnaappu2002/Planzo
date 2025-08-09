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
import { ShowProfileDetailsInClientUseCase } from "../../useCases/client/profile/showProfileDetailsClientsUseCase";
import { UpdateProfileClientUseCase } from "../../useCases/client/profile/updateProfileDataClientUseCase";
import { EventsClientController } from "../../adapters/controllers/client/event/eventClientController";
import { FindAllEventsUseCase } from "../../useCases/client/events/findAllEventsUseCase";
import { EventRepository } from "../../adapters/repository/event/eventRepository";
import { FindEventByIdUseCase } from "../../useCases/client/events/findEventsByIdUseCase";
import { CreateTicketUseCase } from "../../useCases/client/ticket/ticketCreationUseCase";
import { TicketClientController } from "../../adapters/controllers/client/ticket/ticketClientController";
import { TicketRepository } from "../../adapters/repository/ticket/ticketRepository";
import { PaymentService } from "../services/paymentService";
import { QrService } from "../services/qrService";
import { PaymentRepository } from "../../adapters/repository/payment/paymentRepository";
import { ConfirmTicketAndPaymentUseCase } from "../../useCases/client/ticket/confirmTicketAndPaymentUseCase";
import { WalletRepository } from "../../adapters/repository/wallet/walletRepository";
import { TransactionRepository } from "../../adapters/repository/transaction/transactionRepository";


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

//events
const eventRepository=new EventRepository()
const findAllEventsClientsUseCase = new FindAllEventsUseCase(eventRepository)
const findEventByIdClientUseCase=new FindEventByIdUseCase(eventRepository)
export const injectedEventClientController = new EventsClientController(findAllEventsClientsUseCase,findEventByIdClientUseCase)

//ticket 
const ticketRepository=new TicketRepository()
const paymentService = new PaymentService()
const qrService=new QrService()
const paymentRepository=new PaymentRepository()
const walletRepository=new WalletRepository()
const transactionRepository=new TransactionRepository()
const createTicketUseCase=new CreateTicketUseCase(eventRepository,ticketRepository,paymentService,qrService,paymentRepository)
const confirmTicketAndPaymentUseCase=new ConfirmTicketAndPaymentUseCase(paymentService,eventRepository,ticketRepository,walletRepository,transactionRepository)
export const injectedTicketClientController = new TicketClientController(createTicketUseCase,confirmTicketAndPaymentUseCase)




