import { FindVendorDTO } from "../../../../dto/vendor/findVendorDTO";

export interface IfindAllVendorUseCase{
    findAllVendor(pageNo:number):Promise<{vendors:FindVendorDTO[] ; totalPages:number}>
}