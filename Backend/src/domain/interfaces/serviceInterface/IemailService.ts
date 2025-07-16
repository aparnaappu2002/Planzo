export interface IemailService{
    sendEmailOtp(email:string,otp:string):Promise<void>
    sendPasswordResetEmail(email:string,resetToken:string,resetUrl:string):Promise<void>
}