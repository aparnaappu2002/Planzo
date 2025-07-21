import { VendorEntity } from "../../../entities/vendorEntitty";
export interface IvendorDatabaseRepositoryInterface{
    createVendor(vendor:VendorEntity):Promise<VendorEntity | null>
    findByEmaill(email:string):Promise<VendorEntity | null>
    resetPassword(vendorId:string,password:string):Promise<VendorEntity |null>
}