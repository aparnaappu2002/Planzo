export interface IresetPasswordClientUseCase{
    resetPassword(email:string,newPassword:string,token:string):Promise<void>
    
}