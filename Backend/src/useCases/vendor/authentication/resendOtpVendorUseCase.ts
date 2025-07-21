import { IemailService } from "../../../domain/interfaces/serviceInterface/IemailService";
import { IotpService } from "../../../domain/interfaces/serviceInterface/IotpInterface";
import { IresendOtpVendorUseCase } from "../../../domain/interfaces/useCaseInterfaces/vendor/authentication/IresendOtpVendorUseCase";
import { EmailComposer } from "../../../framework/services/emailComposer";

export class ResendOtpVendorUseCase implements IresendOtpVendorUseCase{
    private emailService:IemailService
    private otpService:IotpService

    constructor(emailService:IemailService,otpService:IotpService){
        this.emailService=emailService
        this.otpService=otpService
    }

    async resendOtp(email: string): Promise<void> {
        const otp=this.otpService.generateOtp()
        await this.otpService.storeOtp(email,otp)
        const {subject,html}=EmailComposer.getOtpEmail(otp)
        await this.emailService.sendEmail(email,subject,html)
    }
}