import { VendorEntity } from "../../../../entities/vendorEntitty";

export interface IrejectVendorUseCase {
    rejectVendor(vendorid:string,newStatus:string,rejectionReason:string):Promise<VendorEntity>
}