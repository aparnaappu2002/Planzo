import { IemailService } from "../../../domain/interfaces/serviceInterface/IemailService";
import { IotpService } from "../../../domain/interfaces/serviceInterface/IotpInterface";
import { IuserExistenceService } from "../../../domain/interfaces/serviceInterface/IuserExistenceService";
import { IsendOtpVendorInterface } from "../../../domain/interfaces/useCaseInterfaces/vendor/authentication/IsendOtpVendorUseCase";
import { EmailComposer } from "../../../framework/services/emailComposer";
export class SendOtpVendorUseCase implements IsendOtpVendorInterface{
    private emailService:IemailService
    private otpService:IotpService
    private userExistence:IuserExistenceService
    constructor(emailService:IemailService,otpService:IotpService,userExistence:IuserExistenceService){
        this.emailService=emailService
        this.otpService=otpService
        this.userExistence=userExistence
    }

    async execute(email: string): Promise<void> {
        const existingEmail=await this.userExistence.emailExists(email)
        if(existingEmail)
        {
            throw new Error("This email already exists")
        }
        const otp=await this.otpService.generateOtp()
        await this.otpService.storeOtp(email,otp)
        const {subject,html}=EmailComposer.getOtpEmail(otp)
        const sendEmail=this.emailService.sendEmail(email,subject,html)

    }
    async verifyOtp(email: string, enteredOtp: string): Promise<boolean> {
        const otpverification= await this.otpService.verifyOtp(email,enteredOtp)
        return otpverification
    }

    async resendOtp(email: string): Promise<void> {
        const otp=await this.otpService.generateOtp()
        await this.otpService.storeOtp(email,otp)
        const {subject,html}=EmailComposer.getOtpEmail(otp)
        const sendEmail=this.emailService.sendEmail(email,subject,html)
        
    }
}