import { clientEntity } from "../../../domain/entities/clientEntity";
import { IadminRepository } from "../../../domain/interfaces/repositoryInterfaces/admin/IadminRepositoryInterface";
import { IadminLoginUseCase } from "../../../domain/interfaces/useCaseInterfaces/admin/authentication/IadminLoginUseCase";
import { hashPassword } from "../../../framework/hashpassword/hashPassword";
import { IwalletRepository } from "../../../domain/interfaces/repositoryInterfaces/wallet/IwalletRepository";
import { generateRandomUuid } from "../../../framework/services/randomUuid";
import { WalletEntity } from "../../../domain/entities/wallet/walletEntity";

export class AdminLoginUseCase implements IadminLoginUseCase{
    private adminRepository:IadminRepository
    private hashPassword:hashPassword
    private walletDatabase: IwalletRepository
    constructor(adminRepository:IadminRepository,walletDatabase:IwalletRepository){
        this.adminRepository=adminRepository
        this.hashPassword=new hashPassword()
        this.walletDatabase=walletDatabase
    }

    async handleLogin(email: string, password: string): Promise<clientEntity | null> {
        const admin = await  this.adminRepository.findByEmail(email)
        if(!admin) throw new Error("Admin not exist in this email")
        if(!admin.isAdmin) throw new Error("You are not Admin")
        const passwordVerify = await this.hashPassword.comparePassword(password,admin.password)
        if(!passwordVerify) throw new Error("Invalid password")
            const walletId = generateRandomUuid()
        const existingWallet = await this.walletDatabase.findWalletByUserId(admin._id!)
        if (!existingWallet) {
            const walletDetails: WalletEntity = {
                balance: 0,
                userId: admin._id!,
                userModel: "client",
                walletId,

            }
            const createWallet = await this.walletDatabase.createWallet(walletDetails)
            if(!createWallet) throw new Error("Error while creating waller")
        }
        return admin
    }
}