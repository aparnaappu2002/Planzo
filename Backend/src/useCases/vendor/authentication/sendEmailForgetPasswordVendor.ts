import { IvendorDatabaseRepositoryInterface } from "../../../domain/interfaces/repositoryInterfaces/vendor/vendorDatabaseRepository";
import { IemailService } from "../../../domain/interfaces/serviceInterface/IemailService";
import { IjwtInterface } from "../../../domain/interfaces/serviceInterface/IjwtService";
import { IsendEmailForgetPasswordVendor } from "../../../domain/interfaces/useCaseInterfaces/vendor/authentication/IsendEmailForgetPasswordVendor";
import { EmailComposer } from "../../../framework/services/emailComposer";

export class sendEmailForgetPasswordVendor implements IsendEmailForgetPasswordVendor{
    private emailService:IemailService
    private jwtService:IjwtInterface
    private vendorDatabase:IvendorDatabaseRepositoryInterface

    constructor(emailService:IemailService,jwtService:IjwtInterface,vendorDatabase:IvendorDatabaseRepositoryInterface){
        this.emailService=emailService
        this.jwtService=jwtService
        this.vendorDatabase=vendorDatabase
    }

    async sendEmailForgetPasswordVendor(email: string): Promise<void> {
        const vendor=await this.vendorDatabase.findByEmaill(email)
        if(!vendor) throw new Error("No vendor Found with this email")
        const resetToken=this.jwtService.generateResetToken(process.env.RESET_SECRET_KEY!,vendor.vendorId,email)
        const resetUrl=`${process.env.ORGIN}/vendor/resetPassword?token=${resetToken}&email=${email}`
        const {subject,html}=EmailComposer.getResetPassword(resetToken,resetUrl)
        await this.emailService.sendEmail(email,subject,html)
    }
}