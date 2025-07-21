import { VendorEntity } from "../../../../entities/vendorEntitty";
export interface IvendorAuthenticationUseCase{
    signupVendor(vendor:VendorEntity):Promise<VendorEntity | null>
}