import { VendorEntity } from "../../../../entities/vendorEntitty";

export interface IfindAllVendorUseCase{
    findAllVendor(pageNo:number):Promise<{vendors:VendorEntity[] | [] ; totalPages:number}>
}