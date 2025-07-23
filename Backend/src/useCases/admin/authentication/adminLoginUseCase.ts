import { clientEntity } from "../../../domain/entities/clientEntity";
import { IadminRepository } from "../../../domain/interfaces/repositoryInterfaces/admin/IadminRepositoryInterface";
import { IadminLoginUseCase } from "../../../domain/interfaces/useCaseInterfaces/admin/authentication/IadminLoginUseCase";
import { hashPassword } from "../../../framework/hashpassword/hashPassword";

export class AdminLoginUseCase implements IadminLoginUseCase{
    private adminRepository:IadminRepository
    private hashPassword:hashPassword
    constructor(adminRepository:IadminRepository){
        this.adminRepository=adminRepository
        this.hashPassword=new hashPassword()
    }

    async handleLogin(email: string, password: string): Promise<clientEntity | null> {
        const admin = await  this.adminRepository.findByEmail(email)
        if(!admin) throw new Error("Admin not exist in this email")
        if(!admin.isAdmin) throw new Error("You are not Admin")
        const passwordVerify = await this.hashPassword.comparePassword(password,admin.password)
        if(!passwordVerify) throw new Error("Invalid password")
        return admin
    }
}