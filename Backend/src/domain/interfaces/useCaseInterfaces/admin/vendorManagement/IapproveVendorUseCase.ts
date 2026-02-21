import { FindVendorDTO } from "../../../../dto/vendor/findVendorDTO";

export interface IapproveVendorUseCase{
    approveVendor(vendorId:string,newStatus:string):Promise<FindVendorDTO>
}