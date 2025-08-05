import { VendorEntity } from "../../../../entities/vendorEntitty";

export interface IapproveVendorUseCase{
    approveVendor(vendorId:string,newStatus:string):Promise<VendorEntity>
}