import { VendorEntity } from "../../../../entities/vendorEntitty";
export interface IForgotPasswordVendorUseCase{
    resetPasswordVendor(email:string,newPassword:string,token:string):Promise<void>
}