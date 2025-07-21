export interface IresendOtpVendorUseCase{
    resendOtp(email:string):Promise<void>
    
}