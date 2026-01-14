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
import { TicketVendorController } from "../../adapters/controllers/vendor/ticket/ticketVendorController";
import { TicketAndUserDetailsOfEventUseCase } from "../../useCases/vendor/ticket/ticketAndUserDetailsofEventUseCase";
import { TicketRepository } from "../../adapters/repository/ticket/ticketRepository";
import { VendorLogoutUseCase } from "../../useCases/vendor/authentication/vendorLogoutUseCase";
import { WorkSampleRepository } from "../../adapters/repository/workSamples/workSampleRepository";
import { WorkSampleCreationUseCase } from "../../useCases/vendor/workSample/workSampleCreationUseCase";
import { FindWorkSamplesOfAVendorUseCase } from "../../useCases/vendor/workSample/findWorkSampleofVendor";
import { WorkSampleController } from "../../adapters/controllers/vendor/workSample/workSampleController";
import { CreateServiceUseCase } from "../../useCases/vendor/service/createServiceUseCase";
import { EditServiceUseCase } from "../../useCases/vendor/service/editServiceUseCase";
import { ChangeStatusServiceUseCase } from "../../useCases/vendor/service/changeStatusServiceUseCase";
import { FindServiceUseCase } from "../../useCases/vendor/service/findServiceUseCase";
import { ServiceRepository } from "../../adapters/repository/service/serviceRepository";
import { ServiceVendorController } from "../../adapters/controllers/vendor/services/serviceVendorController";
import { CategoryDatabaseRepository } from "../../adapters/repository/category/categoryRepository";
import { FindCategoryForServiceUseCase } from "../../useCases/vendor/service/findCategoryUseCase";
import { BookingRepository } from "../../adapters/repository/booking/bookingRepository";
import { ShowBookingsInVendorUseCase } from "../../useCases/vendor/booking/showBookingsInVendor";
import { ApproveBookingUseCase } from "../../useCases/vendor/booking/approveBookingsInVendor";
import { RejectBookingInVendorUseCase } from "../../useCases/vendor/booking/rejectBookingVendorUseCase";
import { UpdateBookingAsCompleteUseCase } from "../../useCases/vendor/booking/updateBookingAsCompletedUseCase";
import { BookingsVendorController } from "../../adapters/controllers/vendor/booking/bookingVendorController";
import { TicketVerificationUseCase } from "../../useCases/vendor/ticket/ticketVerificationUseCase";
import { FindTransactionByPaymentUseCase } from "../../useCases/transaction/findTransactionByPaymentStatusUseCase";
import { PdfGenerateVendorUseCase } from "../../useCases/vendor/dashboard/vendorPdfGenerateUseCase";
import { VendorDashboardUseCase } from "../../useCases/vendor/dashboard/vendorDashboardUseCase";
import { VendorDashboardController } from "../../adapters/controllers/vendor/dashboard/vendorDashboardController";
import { PdfServiceVendor } from "../services/pdfServiceVendor";
import { SearchServiceVendorUseCase } from "../../useCases/vendor/service/searchServiceVendorUseCase";
import { SearchEventsVendorUseCase } from "../../useCases/vendor/event/searchEventsVendorUseCase";


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
const searchEventsVendorUseCase=new SearchEventsVendorUseCase(eventRepository)
export const injectedEventController = new EventController(eventCreationUseCase,findAllEventsUseCase,updateEventUseCase,searchEventsVendorUseCase)

//wallet
const walletRepository=new WalletRepository()
const transactionRepository=new TransactionRepository()
const findWalletUseCase=new FindWalletUseCase(walletRepository)
const findTransactionUseCase=new FindTransactionsUseCase(transactionRepository)
const findTransactionByPaymentStatusUseCase=new FindTransactionByPaymentUseCase(transactionRepository)
export const injectedWalletVendorController = new WalletVendorController(findWalletUseCase,findTransactionUseCase,findTransactionByPaymentStatusUseCase)

//ticket
const ticketRepository=new TicketRepository()
const ticketAndUserDetailsOfEventUseCase=new TicketAndUserDetailsOfEventUseCase(ticketRepository)
const ticketVerificationUseCase=new TicketVerificationUseCase(ticketRepository,eventRepository)
export const injectedTicketVendorController= new TicketVendorController(ticketAndUserDetailsOfEventUseCase,ticketVerificationUseCase)

//workSample
const workSampleRepository=new WorkSampleRepository()
const workSampleCreationUseCase=new WorkSampleCreationUseCase(workSampleRepository)
const findWorkSampleofVendorUseCase=new FindWorkSamplesOfAVendorUseCase(workSampleRepository)
export const injectedWorkSampleController= new WorkSampleController(workSampleCreationUseCase,findWorkSampleofVendorUseCase)

//service
const categoryRepository=new CategoryDatabaseRepository()
const serviceRepository=new ServiceRepository()
const findCategoryForCreatingService=new FindCategoryForServiceUseCase(categoryRepository)
const createServiceUseCase=new CreateServiceUseCase(serviceRepository)
const editServiceUseCase=new EditServiceUseCase(serviceRepository)
const changeStatusServiceUseCase=new ChangeStatusServiceUseCase(serviceRepository)
const findServiceUseCase=new FindServiceUseCase(serviceRepository)
const searchServiceVendorUseCase=new SearchServiceVendorUseCase(serviceRepository)
export const injectedServiceVendorControllerUseCase=new ServiceVendorController(findCategoryForCreatingService,createServiceUseCase,editServiceUseCase,changeStatusServiceUseCase,findServiceUseCase,searchServiceVendorUseCase)

//bookings
const bookingRepository=new BookingRepository()
const showBookingsInVendorUseCase=new ShowBookingsInVendorUseCase(bookingRepository)
const approveBookingVendorUseCase=new ApproveBookingUseCase(bookingRepository)
const rejectBookingVendorUseCase=new RejectBookingInVendorUseCase(bookingRepository)
const updateBookingAsCompleteUseCase=new UpdateBookingAsCompleteUseCase(bookingRepository)
export const injectedBookingVendorController = new BookingsVendorController(showBookingsInVendorUseCase,approveBookingVendorUseCase,rejectBookingVendorUseCase,updateBookingAsCompleteUseCase)


//dashboard
const vendorDashboardUseCase=new VendorDashboardUseCase(walletRepository,transactionRepository,eventRepository,bookingRepository)
const pdfServiceVendor=new PdfServiceVendor()
const pdfGenerateVendorUseCase=new PdfGenerateVendorUseCase(eventRepository,bookingRepository,pdfServiceVendor)
export const injectedVendorDashboardController = new VendorDashboardController(vendorDashboardUseCase,pdfGenerateVendorUseCase)