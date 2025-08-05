import { VendorEntity } from "../../../../entities/vendorEntitty"
export interface IupdateDetailsVendor {
    updateDetailsVendor(vendorId: string, about: string, phone: string,name:string): Promise<VendorEntity>
}