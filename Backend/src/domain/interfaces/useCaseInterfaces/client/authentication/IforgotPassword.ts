import { clientEntity } from "../../../../entities/clientEntity";
export interface IresetPasswordClientUseCase{
    resetPassword(email:string,newPassword:string,token:string):Promise<void>
    
}