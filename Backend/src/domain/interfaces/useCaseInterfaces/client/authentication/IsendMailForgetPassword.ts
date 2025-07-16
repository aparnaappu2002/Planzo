export interface IsendMailForgetPasswordClient{
    sendMailForForgetPassword(email:string):Promise<void>
}