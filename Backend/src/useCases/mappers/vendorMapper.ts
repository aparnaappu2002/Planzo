import { VendorEntity } from "../../domain/entities/vendorEntitty";
import { FindVendorDTO } from "../../domain/dto/vendor/findVendorDTO";

export const mapVendorEntityToDTO = (vendor: VendorEntity): FindVendorDTO => ({
    _id: vendor._id?.toString(),
    name: vendor.name,
    email: vendor.email,
    phone: vendor.phone,
    role: vendor.role,
    status: vendor.status,
    profileImage: vendor.profileImage,
    vendorId: vendor.vendorId,
    vendorStatus: vendor.vendorStatus,
    aboutVendor: vendor.aboutVendor
});