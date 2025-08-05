import { VendorEntity } from "../../../../entities/vendorEntitty";

export interface IfindPendingVendors{
    findPendingVendors(pageNo:number):Promise<{pendingVendors:VendorEntity[] | [];totalPages:number}>
}