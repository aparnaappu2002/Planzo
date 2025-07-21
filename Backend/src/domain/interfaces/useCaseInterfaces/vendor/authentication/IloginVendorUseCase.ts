import { VendorEntity } from "../../../../entities/vendorEntitty";

export interface IloginVendorUseCase{
    loginVendor(email:string,password:string):Promise<VendorEntity|null>
}