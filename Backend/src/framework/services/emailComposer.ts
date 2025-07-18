import { otpEmailTemplate } from "../../templates/otpTemplate";
import { resetPasswordEmailTemplate } from "../../templates/resetPasswordEmailTemplate";

export class EmailComposer{
    static getOtpEmail(otp:string):{subject:string,html:string}{
        return{
            subject:'Your OTP Code',
            html:otpEmailTemplate(otp)
        }
    }

    static getResetPassword(token:string,url:string):{subject:string,html:string}{
        return {
            subject:"Password Reset Request",
            html:resetPasswordEmailTemplate(token,url)
        }
    }
}

