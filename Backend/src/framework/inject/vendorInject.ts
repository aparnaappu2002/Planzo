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
import { LoginLogoutVendorController } from "../../adapters/controllers/vendor/authentication/loginVendor";
import { sendEmailForgetPasswordVendor } from "../../useCases/vendor/authentication/sendEmailForgetPasswordVendor";
import { ForgotPasswordVendorController } from "../../adapters/controllers/vendor/authentication/forgotPasswordVendorController";
import { ResetPasswordVendorUseCase } from "../../useCases/vendor/authentication/forgotPasswordVendorUseCase";
import { ResendOtpVendorUseCase } from "../../useCases/vendor/authentication/resendOtpVendorUseCase";
import { updateDetailsVendorUseCase } from "../../useCases/vendor/profile/updateVendorDetailsVendorUseCase";
import { ProfileVendorController } from "../../adapters/controllers/vendor/profile/profileVendorController";
import { ChangePasswordVendorUseCase } from "../../useCases/vendor/profile/changePasswordVendorUseCase";
import { hashPassword } from "../hashpassword/hashPassword";
import { EventRepository } from "../../adapters/repository/event/eventRepository";
import { EventCreationUseCase } from "../../useCases/vendor/event/eventCreationUseCase";
import { EventController } from "../../adapters/controllers/vendor/event/eventController";
import { FindAllEventsVendorUseCase } from "../../useCases/vendor/event/findAllEventsUseCase";
import { UpdateEventUseCase } from "../../useCases/vendor/event/updateEventUseCase";
import { WalletVendorController } from "../../adapters/controllers/vendor/wallet/walletVendorController";
import { FindWalletUseCase } from "../../useCases/wallet/findWalletUseCase";
import { FindTransactionsUseCase } from "../../useCases/transaction/findTransactionUseCase";
import { WalletRepository } from "../../adapters/repository/wallet/walletRepository";
import { TransactionRepository } from "../../adapters/repository/transaction/transactionRepository";
import { TicketAndUserDetailsController } from "../../adapters/controllers/vendor/ticket/ticketAndUserDetailsVendorController";
import { TicketAndUserDetailsOfEventUseCase } from "../../useCases/vendor/ticket/ticketAndUserDetailsofEventUseCase";
import { TicketRepository } from "../../adapters/repository/ticket/ticketRepository";
import { VendorLogoutUseCase } from "../../useCases/vendor/authentication/vendorLogoutUseCase";


const EmailService  = new emailService()
const otpService = new OtpService()
const vendorRepository = new VendorDatabase()
const clientDatabase = new clientRepository()
const UserExistence = new userExistence(clientDatabase,vendorRepository)

const injectedVendorRegisterUsecase=new VendorRegisterUseCase(vendorRepository)
const sendOtpVendorUseCase=new SendOtpVendorUseCase(EmailService,otpService,UserExistence)
const resendOtpVendorUseCase = new ResendOtpVendorUseCase(EmailService,otpService)
export const injectedVendorAuthenticationController=new VendorAuthenticationController(injectedVendorRegisterUsecase,sendOtpVendorUseCase,resendOtpVendorUseCase)

//login vendor
const vendorLoginUseCase=new LoginVendorUseCase(vendorRepository)
const jwtService=new JwtService()
const redisService=new RedisService()
const vendorLogoutUseCase=new VendorLogoutUseCase(redisService,jwtService)
export const injectedVendorLoginLogoutController=new LoginLogoutVendorController(vendorLoginUseCase,jwtService,redisService,vendorLogoutUseCase)

// forgot password
const SendEmailForgetPasswordVendor=new sendEmailForgetPasswordVendor(EmailService,jwtService,vendorRepository)
const resetPasswordVendorUseCase=new ResetPasswordVendorUseCase(jwtService,vendorRepository)
export const injectedForgotPasswordVendorController = new ForgotPasswordVendorController(SendEmailForgetPasswordVendor,resetPasswordVendorUseCase)



//Vendor profile 
const Hashpassword= new hashPassword()
const changePasswordVendorUseCase = new ChangePasswordVendorUseCase(vendorRepository,Hashpassword)
const UpdateDetailsVendorUseCase = new updateDetailsVendorUseCase(vendorRepository)
export const injectedProfileVendorController = new ProfileVendorController(changePasswordVendorUseCase,UpdateDetailsVendorUseCase)


//event creation
const eventRepository = new EventRepository()
const eventCreationUseCase = new EventCreationUseCase(eventRepository)
const findAllEventsUseCase = new FindAllEventsVendorUseCase(eventRepository)
const updateEventUseCase = new UpdateEventUseCase(eventRepository)
export const injectedEventController = new EventController(eventCreationUseCase,findAllEventsUseCase,updateEventUseCase)

//wallet
const walletRepository=new WalletRepository()
const transactionRepository=new TransactionRepository()
const findWalletUseCase=new FindWalletUseCase(walletRepository)
const findTransactionUseCase=new FindTransactionsUseCase(transactionRepository)
export const injectedWalletVendorController = new WalletVendorController(findWalletUseCase,findTransactionUseCase)

//ticket
const ticketRepository=new TicketRepository()
const ticketAndUserDetailsOfEventUseCase=new TicketAndUserDetailsOfEventUseCase(ticketRepository)
export const injectedTicketAndUserDetailsOfEventController= new TicketAndUserDetailsController(ticketAndUserDetailsOfEventUseCase)
