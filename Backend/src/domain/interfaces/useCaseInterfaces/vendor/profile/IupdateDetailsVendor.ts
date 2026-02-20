import { ProfileVendorDto } from "../../../../dto/vendor/profileVendorDTO"
export interface IupdateDetailsVendor {
    updateDetailsVendor(vendorId: string, about: string, phone: string,name:string): Promise<ProfileVendorDto>
}