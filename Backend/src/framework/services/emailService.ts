import { IemailService } from "../../domain/interfaces/serviceInterface/IemailService";
import nodemailer from 'nodemailer'

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
    async sendEmail(to: string, subject:string, html: string): Promise<void> {
        const mailOptions={
            from:process.env.NODEMAILER_EMAIL,
            to,
            subject,
            html
        }
        try{
            await this.transporter.sendMail(mailOptions)
            console.log(`Email sended to ${to}`)
        }catch(error){
            console.log('error while sending email',error)
            throw new Error('failed to send email')
        }
    }
    // async sendPasswordResetEmail(email: string, resetToken: string, resetUrl: string): Promise<void> {
    //     const mailOptions = {
    //         from:process.env.NODEMAILER_EMAIL,
    //         to:email,
    //         subject:"Password Reset Request",
    //         html:resetPasswordEmailTemplate(resetToken,resetUrl)
    //     }
    //     try{
    //         await this.transporter.sendMail(mailOptions)
    //         console.log(`Password reset email sent to ${email}`)
    //     }catch(error){
    //         console.log("Error while sending password reset email:",error)
    //         throw new Error("Failed to send password reset email")
    //     }
    // }
}

