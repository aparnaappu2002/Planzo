import { IemailService } from "../../../domain/interfaces/serviceInterface/IemailService";
import { IotpService } from "../../../domain/interfaces/serviceInterface/IotpInterface";
import { IuserExistenceService } from "../../../domain/interfaces/serviceInterface/IuserExistenceService";
import { IsendOtpClientInterface } from "../../../domain/interfaces/useCaseInterfaces/client/authentication/sendOtpClientInterface";
import { EmailComposer } from "../../../framework/services/emailComposer";

export class sendOtpClientUseCase implements IsendOtpClientInterface{
    private otpService: IotpService
    private emailService: IemailService
    private userExistence: IuserExistenceService
    constructor(otpService:IotpService,emailService:IemailService,userExistence:IuserExistenceService){
        this.otpService=otpService
        this.emailService=emailService
        this.userExistence=userExistence
    }

    async execute(email: string): Promise<void> {
        const existingUser=await this.userExistence.emailExists(email)
        if(existingUser) throw new Error("This email is already exists")
        const otp=this.otpService.generateOtp()
        await this.otpService.storeOtp(email,otp)
        const {subject,html}=EmailComposer.getOtpEmail(otp)
        await this.emailService.sendEmail(email,subject,html)
    }
    async verifyOtp(email: string, enteredOtp: string): Promise<boolean> {
        const verify=await this.otpService.verifyOtp(email,enteredOtp)
        return verify
    }
    async resendOtp(email: string): Promise<void> {
        const otp=this.otpService.generateOtp()
        await this.otpService.storeOtp(email,otp)
        const {subject,html}=EmailComposer.getOtpEmail(otp)
        await this.emailService.sendEmail(email,subject,html)
    }
}