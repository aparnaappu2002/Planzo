import {Request,Response} from 'express'
import { IclientUsecase } from '../../../../domain/interfaces/useCaseInterfaces/client/authentication/clientUseCaseInterface'
import { IsendOtpClientInterface } from '../../../../domain/interfaces/useCaseInterfaces/client/authentication/sendOtpClientInterface'
import { HttpStatus } from '../../../../domain/enums/httpStatus'
import { Messages } from '../../../../domain/enums/messages'

export class ClientAuthenticationController{
    private clientUseCase: IclientUsecase
    private clientSendOtpUseCase: IsendOtpClientInterface
    constructor(clientUseCase:IclientUsecase,clientSendOtpUseCase:IsendOtpClientInterface){
        this.clientUseCase=clientUseCase
        this.clientSendOtpUseCase=clientSendOtpUseCase
    }

    async sendOtp(req:Request,res:Response):Promise<void>{
        try{
            const data=req.body
            await this.clientSendOtpUseCase.execute(data.email)
            res.status(HttpStatus.OK).json({message:Messages.OTP_SENT})
            return
        }catch(error){
            console.log("error while sending otp",error)
            res.status(HttpStatus.BAD_REQUEST).json({message:Messages.OTP_SEND_ERROR,error:error instanceof Error? error.message : Messages.OTP_SEND_ERROR})
        }
    }
    async register(req:Request,res:Response):Promise<void>{
        try{
            const {formdata,otpString}=req.body
            const verify=await this.clientSendOtpUseCase.verifyOtp(formdata.email,otpString)
            if(verify){
                const client=await this.clientUseCase.createClient(formdata)
                res.status(HttpStatus.CREATED).json({message:Messages.ACCOUNT_CREATED,client})
                return
            }
            else{
                res.status(HttpStatus.BAD_REQUEST).json({message:Messages.OTP_INVALID})
            }
        }catch(error){
            console.log("error while creating client",error)
            res.status(HttpStatus.BAD_REQUEST).json({
                message:Messages.ACCOUNT_CREATE_ERROR,
                error:error instanceof Error ? error.message : Messages.ACCOUNT_CREATE_ERROR,
                stack: error instanceof Error ? error.stack : undefined
            })
        }

    }
    async resendOtp(req:Request,res:Response):Promise<void>{
        try{
            const {email}=req.body
            console.log('this is the email for resending the otp',email)
            await this.clientSendOtpUseCase.resendOtp(email)
            res.status(HttpStatus.OK).json({message:Messages.OTP_RESENT})
        }catch(error){
            console.log('error while resending the otp',error)
            res.status(HttpStatus.BAD_REQUEST).json({
                message:Messages.OTP_RESEND_ERROR,
                error:error instanceof Error ? error.message : Messages.OTP_RESEND_ERROR})
        }
    }
}