import { VendorEntity } from "../../../../entities/vendorEntitty"

export interface IfindVendorForClientUseCase {
    findVendorForClientUseCase(): Promise<VendorEntity[] | []>
}