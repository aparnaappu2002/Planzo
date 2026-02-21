import { FindVendorDTO } from "../../../../dto/vendor/findVendorDTO";

export interface IfindPendingVendors{
    findPendingVendors(pageNo:number):Promise<{pendingVendors:FindVendorDTO[];totalPages:number}>
}