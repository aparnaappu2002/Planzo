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
import { ProfileClientController } from "../../adapters/controllers/client/profile/ClientProfileController";
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
import { searchEventsUseCase } from "../../useCases/client/events/searchEventsUseCase";
import { FindEventsNearToClientUseCase } from "../../useCases/client/events/findEventsNearToClient";
import { ShowTicketAndEventClientUseCase } from "../../useCases/client/ticket/showBookingEventsUseCase";
import { TicketCancelUseCase } from "../../useCases/client/ticket/ticketCancelUseCase";
import { FindWalletUseCase } from "../../useCases/wallet/findWalletUseCase";
import { ClientWalletController } from "../../adapters/controllers/client/wallet/walletClientController";
import { FindTransactionsUseCase } from "../../useCases/transaction/findTransactionUseCase";
import { FindEventsBasedOnCategoryUseCase } from "../../useCases/client/events/findEventsBasedOnCategory";
import { FindCategoryClientUseCase } from "../../useCases/client/category/findCategoryUseCase";
import { CategoryClientController } from "../../adapters/controllers/client/category/categoryClientController";
import { CategoryDatabaseRepository } from "../../adapters/repository/category/categoryRepository";
import { SearchEventsOnLocationUseCase } from "../../useCases/client/events/searchEventsOnLocationUseCase";
import { CheckTicketLimitUseCase } from "../../useCases/client/ticket/checkTicketLimitUseCase";
import { VendorForClientController } from "../../adapters/controllers/client/vendor/vendorsInClientController";
import { FindVendorForClientUseCase } from "../../useCases/client/vendors/findVendorForClientUseCase";
import { FindVendorProfileUseCase } from "../../useCases/client/vendors/findVendorProfileUseCase";
import { WorkSampleRepository } from "../../adapters/repository/workSamples/workSampleRepository";
import { ServiceRepository } from "../../adapters/repository/service/serviceRepository";
import { ServiceClientController } from "../../adapters/controllers/client/service/serviceClientController";
import { FindServiceUseCaseClient } from "../../useCases/client/service/findServiceClientUseCase";
import { FindServiceOnCategorybasisUseCase } from "../../useCases/client/service/findServiceOnCategoryUseCase";
import { SearchServiceUseCase } from "../../useCases/client/service/searchServiceUseCase";
import { BookingRepository } from "../../adapters/repository/booking/bookingRepository";
import { ReviewRepository } from "../../adapters/repository/review/reviewRepository";
import { ServiceWithVendorUseCase } from "../../useCases/client/booking/showServiceWithVendorUseCase";
import { CreateBookingUseCase } from "../../useCases/client/booking/createBookingUseCase";
import { ShowBookingsInClientUseCase } from "../../useCases/client/booking/showBookingsInClientUseCase";
import { BookingClientController } from "../../adapters/controllers/client/booking/bookingClientController";
import { CreateBookingPaymentUseCase } from "../../useCases/client/booking/createBookingPaymentUseCase";
import { ConfirmBookingPaymentUseCase } from "../../useCases/client/booking/confirmaBookingPaymentUseCase";
import { CancelBookingUseCase } from "../../useCases/client/booking/cancelBookingUseCase";
import { ReviewController } from "../../adapters/controllers/client/review/reviewController";
import { AddReviewUseCase } from "../../useCases/client/review/addReviewUseCase";
import { ShowReviewsUseCase } from "../../useCases/client/review/showReviewsUseCase";
import { FindTicketsByStatusUseCase } from "../../useCases/client/ticket/findTicketsBasedOnStatusUseCase";
import { StripePayoutService } from "../services/payoutService";


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
const SearchEventsUseCase=new searchEventsUseCase(eventRepository)
const findEventsNearToClientUseCase=new FindEventsNearToClientUseCase(eventRepository)
const findEventsBasedOnCategoryUseCase=new FindEventsBasedOnCategoryUseCase(eventRepository)
const searchEventsOnLocationUseCase=new SearchEventsOnLocationUseCase(eventRepository)
export const injectedEventClientController = new EventsClientController(findAllEventsClientsUseCase,findEventByIdClientUseCase,SearchEventsUseCase,findEventsNearToClientUseCase,findEventsBasedOnCategoryUseCase,searchEventsOnLocationUseCase)

//ticket 
const ticketRepository=new TicketRepository()
const paymentService = new PaymentService()
const payoutService=new StripePayoutService()
const qrService=new QrService()
const paymentRepository=new PaymentRepository()
const walletRepository=new WalletRepository()
const transactionRepository=new TransactionRepository()
const createTicketUseCase=new CreateTicketUseCase(eventRepository,ticketRepository,paymentService,qrService,paymentRepository)
const confirmTicketAndPaymentUseCase=new ConfirmTicketAndPaymentUseCase(paymentService,eventRepository,ticketRepository,walletRepository,transactionRepository)
const showTicketAndEventUseCase=new ShowTicketAndEventClientUseCase(ticketRepository)
const ticketCancelUseCase=new TicketCancelUseCase(ticketRepository,walletRepository,transactionRepository,payoutService)
const checkTicketLimitUseCase=new CheckTicketLimitUseCase(ticketRepository)
const findTicketByStatusUseCase=new FindTicketsByStatusUseCase(ticketRepository)
export const injectedTicketClientController = new TicketClientController(createTicketUseCase,confirmTicketAndPaymentUseCase,showTicketAndEventUseCase,ticketCancelUseCase,checkTicketLimitUseCase,findTicketByStatusUseCase)

//wallet
const findWalletClientUseCase = new FindWalletUseCase(walletRepository)
const findTransactionUseCase=new FindTransactionsUseCase(transactionRepository)
export const injectedWalletClientController= new ClientWalletController(findWalletClientUseCase,findTransactionUseCase)

//category
const categoryRepository=new CategoryDatabaseRepository()
const findCategoryClientUSeCase=new FindCategoryClientUseCase(categoryRepository)
export const injectedCategoryClientController = new CategoryClientController(findCategoryClientUSeCase) 

//vendors in client side
const findVendorForClientUseCase=new FindVendorForClientUseCase(VendorRepository)
const workSampleRepository=new WorkSampleRepository()
const serviceRepository=new ServiceRepository()
const findVendorProfileUseCase=new FindVendorProfileUseCase(workSampleRepository,serviceRepository)
export const injectedVendorForClientController = new VendorForClientController(findVendorForClientUseCase,findVendorProfileUseCase)

//service
const findServiceClientUseCase=new FindServiceUseCaseClient(serviceRepository)
const findServiceBasedOnCatagory=new FindServiceOnCategorybasisUseCase(serviceRepository)
const searchServiceUseCase=new SearchServiceUseCase(serviceRepository)
export const injectedServiceClientController = new ServiceClientController(findServiceClientUseCase,findServiceBasedOnCatagory,searchServiceUseCase)


//bookings
const bookingRepository=new BookingRepository()
const reviewRepository=new ReviewRepository()
const serviceWithVendorUseCase=new ServiceWithVendorUseCase(serviceRepository,reviewRepository)
const createBookingUseCase=new CreateBookingUseCase(bookingRepository)
const showBookingsInClientUseCase=new ShowBookingsInClientUseCase(bookingRepository)
const createBookingPaymentUseCase=new CreateBookingPaymentUseCase(bookingRepository,paymentService,paymentRepository)
const confirmaBookingPaymentUseCase=new ConfirmBookingPaymentUseCase(bookingRepository,paymentRepository,walletRepository,transactionRepository,paymentService)
const cancelBookingUseCase=new CancelBookingUseCase(bookingRepository)
export const injectedBookingClientController=new BookingClientController(serviceWithVendorUseCase,createBookingUseCase,showBookingsInClientUseCase,createBookingPaymentUseCase,confirmaBookingPaymentUseCase,cancelBookingUseCase)

//reviews

const addReviewUseCase=new AddReviewUseCase(reviewRepository)
const showReviewsUseCase=new ShowReviewsUseCase(reviewRepository)
export const injectedReviewController=new ReviewController(addReviewUseCase,showReviewsUseCase)