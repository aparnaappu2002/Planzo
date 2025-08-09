import { AdminRepository } from "../../adapters/repository/admin/adminRepository";
import { AdminLoginController } from "../../adapters/controllers/admin/authentication/adminLoginController";
import { AdminLoginUseCase } from "../../useCases/admin/authentication/adminLoginUseCase";
import { JwtService } from "../services/jwtService";
import { RedisService } from "../services/redisService";
import { BlockClientUseCase } from "../../useCases/admin/userManagement/clientBlockUseCase";
import { clientRepository } from "../../adapters/repository/client/clientRespository";
import { ClientUnblockUseCase } from "../../useCases/admin/userManagement/clientUnblockUseCase";
import { FindAllClientUseCase } from "../../useCases/admin/userManagement/findAllClientUseCase";
import { VendorDatabase } from "../../adapters/repository/vendor/vendorDatabase";
import { FindAllVendorUseCase } from "../../useCases/admin/vendorManagement/findAllVendorUseCase";
import { FindVendorController } from "../../adapters/controllers/admin/vendorManagement/findVendorController";
import { VendorBlockUseCase } from "../../useCases/admin/vendorManagement/vendorBlockUseCase";
import { VendorBlockUnblockController } from "../../adapters/controllers/admin/vendorManagement/vendorBlockUnblockController";
import { VendorUnblockUseCase } from "../../useCases/admin/vendorManagement/vendorUnblockUseCase";
import { RejectVendorUseCase } from "../../useCases/admin/vendorManagement/rejectVendorUseCase";
import { ApproveVendorUseCase } from "../../useCases/admin/vendorManagement/approveVendorUseCase";
import { VendorStatusController } from "../../adapters/controllers/admin/vendorManagement/vendorStatusController";
import { FindAllPendingVendorsUseCase } from "../../useCases/admin/vendorManagement/findAllPendingVendorsUseCase";
import { UserManagementController } from "../../adapters/controllers/admin/userManagement/userManagementController";
import { SearchClientsUseCase } from "../../useCases/admin/userManagement/searchClientUseCase";
import { SearchVendorsUseCase } from "../../useCases/admin/vendorManagement/searchVendorUseCase";
import { WalletRepository } from "../../adapters/repository/wallet/walletRepository";


const adminRepository=new AdminRepository()
const walletRepository=new WalletRepository()
const adminLoginUseCase=new AdminLoginUseCase(adminRepository,walletRepository)
const jwtService=new JwtService()
const redisService=new RedisService()
export const injectedAdminLoginController = new AdminLoginController(adminLoginUseCase,jwtService,redisService)


const ClientRepository=new clientRepository()

//user management
const blockClientUseCase = new BlockClientUseCase(ClientRepository)
const unblockClientUseCase = new ClientUnblockUseCase(ClientRepository)
const findAllClientUseCase = new FindAllClientUseCase(ClientRepository)
const searchClientUseCase=new SearchClientsUseCase(ClientRepository)
export const injectedUserManagementController = new UserManagementController(blockClientUseCase,unblockClientUseCase,findAllClientUseCase,redisService,searchClientUseCase)

//find all vendors , pending vendors
const VendorRepository =new VendorDatabase()
const findAllVendorUseCase = new FindAllVendorUseCase(VendorRepository)
const findAllPendingVendorUseCase = new FindAllPendingVendorsUseCase(VendorRepository)
export const injectedFindVendorsController= new FindVendorController(findAllVendorUseCase,findAllPendingVendorUseCase)


//block vendor or unblock vendor
const blockVendorUseCase = new VendorBlockUseCase(VendorRepository)
const unblockVendorUseCase = new VendorUnblockUseCase(VendorRepository)
const searchVendorUseCase=new SearchVendorsUseCase(VendorRepository)
export const injectedBlockUnblockController = new VendorBlockUnblockController(unblockVendorUseCase,blockVendorUseCase,searchVendorUseCase,redisService)


//approve vendor or reject vendor

const approveVendorUseCase =  new ApproveVendorUseCase(VendorRepository)
const rejectVendorUseCase = new RejectVendorUseCase(VendorRepository)
export const injectedVendorStatusController = new VendorStatusController(approveVendorUseCase,rejectVendorUseCase)
