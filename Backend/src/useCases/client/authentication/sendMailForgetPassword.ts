import { IClientDatabaseRepository } from "../../../domain/interfaces/repositoryInterfaces/client/clientDatabaseRepository";
import { IemailService } from "../../../domain/interfaces/serviceInterface/IemailService";
import { IjwtInterface } from "../../../domain/interfaces/serviceInterface/IjwtService";
import { IsendMailForgetPasswordClient } from "../../../domain/interfaces/useCaseInterfaces/client/authentication/IsendMailForgetPassword";
import { EmailComposer } from "../../../framework/services/emailComposer";

export class sendMailForgetPasswordClient implements IsendMailForgetPasswordClient{
    private resetMailService:IemailService
    private jwtService:IjwtInterface
    private clientDatabase:IClientDatabaseRepository
    constructor(resetMailService:IemailService,jwtService:IjwtInterface,clientDatabase:IClientDatabaseRepository){
        this.resetMailService=resetMailService
        this.jwtService=jwtService
        this.clientDatabase=clientDatabase
    }
    async sendMailForForgetPassword(email: string): Promise<void> {
        const client = await this.clientDatabase.findByEmail(email)
        if(!client) throw new Error("No Client found with this email")
        if(client.googleVerified) throw new Error("This account is linked to Google.Please reset your password through your google account settings")
        
        const resetToken = this.jwtService.generateResetToken(process.env.RESET_SECRET_KEY!,client.clientId,email)
        
        const resetUrl=`${process.env.ORGIN}/resetPassword?token=${resetToken}&email=${email}`
        const {subject,html}=EmailComposer.getResetPassword(resetToken,resetUrl)
        await this.resetMailService.sendEmail(email,subject,html)
    }
}