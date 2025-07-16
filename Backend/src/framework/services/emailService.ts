import { IemailService } from "../../domain/interfaces/serviceInterface/IemailService";
import nodemailer from 'nodemailer'
import {otpEmailTemplate} from "../../templates/otpTemplate"
import { resetPasswordEmailTemplate } from "../../templates/resetPasswordEmailTemplate";
export class emailService implements IemailService{
    private transporter:nodemailer.Transporter
    constructor(){
        this.transporter=nodemailer.createTransport({
            service:"gmail",
            auth:{
                user:process.env.NODEMAILER_EMAIL,
                pass:process.env.NODEMAILER_PASSWORD
            }
        })
    }
    async sendEmailOtp(email: string, otp: string): Promise<void> {
        const mailOptions={
            from:process.env.NODEMAILER_EMAIL,
            to:email,
            subject:"Your otp code",
            html:otpEmailTemplate(otp)
        }
        try{
            await this.transporter.sendMail(mailOptions)
            console.log(`Otp sended to ${email}`)
        }catch(error){
            console.log('error while sending otp',error)
            throw new Error('failed to send otp')
        }
    }
    async sendPasswordResetEmail(email: string, resetToken: string, resetUrl: string): Promise<void> {
        const mailOptions = {
            from:process.env.NODEMAILER_EMAIL,
            to:email,
            subject:"Password Reset Request",
            html:resetPasswordEmailTemplate(resetToken,resetUrl)
        }
        try{
            await this.transporter.sendMail(mailOptions)
            console.log(`Password reset email sent to ${email}`)
        }catch(error){
            console.log("Error while sending password reset email:",error)
            throw new Error("Failed to send password reset email")
        }
    }
}

