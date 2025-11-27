import { VendorEntity } from "../../../entities/vendorEntitty";
export interface IvendorDatabaseRepositoryInterface{
    createVendor(vendor:VendorEntity):Promise<VendorEntity | null>
    findByEmaill(email:string):Promise<VendorEntity | null>
    resetPassword(vendorId:string,password:string):Promise<VendorEntity |null>
    findAllVendors(pageNo: number): Promise<{ Vendors: VendorEntity[] | []; totalPages: number }>
    blockVendor(vendorId:string):Promise<string | null>
    unblockVendor(vendorId:string):Promise<string | null>
    findAllPendingVendors(pageNo: number): Promise<{ pendingVendors: VendorEntity[] | []; totalPages: number }>
    findById(vendorId: string): Promise<VendorEntity | null>
    rejectPendingVendor(vendorId: string, newStatus: string, rejectionReason: string): Promise<VendorEntity>
    changeVendorStatus(vendorId: string, newStatus: string): Promise<VendorEntity>
    updateDetailsVendor(vendorId: string, about: string, phone: string, name: string): Promise<VendorEntity | null>
    changePassword(vendorId: string, newPassword: string): Promise<boolean>
    findPassword(vendorId: string): Promise<string | null>
    findStatusForMiddleware(vendorId: string): Promise<{ status: string, vendorStatus: string } | null>
    searchVendors(search: string): Promise<VendorEntity[]>
    findVendorsForCarousal(): Promise<VendorEntity[] | []>
    findTotalVendor(): Promise<number>

}