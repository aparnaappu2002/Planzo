import { FindVendorDTO } from "../../../../dto/vendor/findVendorDTO";

export interface IrejectVendorUseCase {
    rejectVendor(vendorid:string,newStatus:string,rejectionReason:string):Promise<FindVendorDTO>
}