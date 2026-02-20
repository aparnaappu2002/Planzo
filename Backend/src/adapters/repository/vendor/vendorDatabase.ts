import { VendorEntity } from "../../../domain/entities/vendorEntitty";
import { IvendorDatabaseRepositoryInterface } from "../../../domain/interfaces/repositoryInterfaces/vendor/vendorDatabaseRepository";
import { VendorModel } from "../../../framework/database/models/vendorModel";
import { VendorStatus } from "../../../domain/enums/vendorStatus";

export class VendorDatabase implements IvendorDatabaseRepositoryInterface{
    async createVendor(vendor: VendorEntity): Promise<VendorEntity> {
        return await VendorModel.create(vendor)
    }
    async findByEmaill(email: string): Promise<VendorEntity | null> {
        return await VendorModel.findOne({email:email})
    }
    async resetPassword(vendorId: string, password: string): Promise<VendorEntity | null> {
        return await VendorModel.findOneAndUpdate({vendorId},{password},{new:true})
    }
    async findAllVendors(pageNo: number): Promise<{ Vendors: VendorEntity[] | []; totalPages: number; }> {
        const limit=5
        const page=Math.max(1,pageNo)
        const skip=(page-1)*limit
        const Vendors = await VendorModel.find({vendorStatus:'approved'}).select('-password').skip(skip).limit(limit)
        const totalPages = Math.ceil(await VendorModel.countDocuments({vendorStatus:'approved'})/limit)
        return {Vendors,totalPages}
    }
    async blockVendor(vendorId: string): Promise<string | null> {
        const blockedVendor = await VendorModel.findByIdAndUpdate(vendorId,{status:'block'}).select('status')
        return blockedVendor?.status || null
    }

    async unblockVendor(vendorId: string): Promise<string | null> {
        const unblockVendor = await VendorModel.findByIdAndUpdate(vendorId,{status:'active'}).select('status')
        return unblockVendor?.status || null
    }
    async findAllPendingVendors(pageNo: number): Promise<{ pendingVendors: VendorEntity[]; totalPages: number; }> {
        const limit = 5
        const page = Math.max(1, pageNo);
        const skip = (page - 1) * limit;
        const pendingVendors = await VendorModel.find({ vendorStatus: 'pending' }).select('-password').skip(skip).limit(limit)
        const totalPages = Math.ceil(await VendorModel.countDocuments({ vendorStatus: 'approved' }) / limit)
        return { pendingVendors, totalPages }
    }
    async findById(vendorId: string): Promise<VendorEntity | null> {
        return await VendorModel.findById(vendorId)
    }
    async rejectPendingVendor(vendorId: string, newStatus: string, rejectionReason: string): Promise<VendorEntity> {
        const vendor = await VendorModel.findByIdAndUpdate(vendorId, { vendorStatus: newStatus, rejectionReason }, { new: true })
        if (!vendor) throw new Error('There is no vendor in this email')
        return vendor
    }
    async changeVendorStatus(vendorId: string, newStatus: VendorStatus): Promise<VendorEntity> {
        const vendor = await VendorModel.findByIdAndUpdate(vendorId, { vendorStatus: newStatus }, { new: true })
        if (!vendor) throw new Error('There is no vendor in this email')
        return vendor
    }
    async updateDetailsVendor(vendorId: string, about: string, phone: string, name: string): Promise<VendorEntity | null> {
        return await VendorModel.findByIdAndUpdate(vendorId, { aboutVendor: about, phone, name }).select('_id email name phone role status vendorId vendorStatus profileImage aboutVendor role').lean() as VendorEntity | null;
    }
    async changePassword(vendorId: string, newPassword: string): Promise<boolean> {
        const changedPasswordVendor = await VendorModel.findByIdAndUpdate(vendorId, { password: newPassword })
        if (!changedPasswordVendor) return false
        return true
    }
    async findPassword(vendorId: string): Promise<string | null> {
        const oldPassword = await VendorModel.findById(vendorId).select('password')
        return oldPassword?.password || null
    }
    async findStatusForMiddleware(vendorId: string): Promise<{ status: string, vendorStatus: string } | null> {
        const status = await VendorModel.findById(vendorId).select('status vendorStatus')
        if (!status) return null
        return { status: status?.status!, vendorStatus: status?.vendorStatus }
    }
    async searchVendors(search: string): Promise<VendorEntity[]> {
    const query: any = { role: "vendor" };
   
    if (search) {
        const orConditions: any[] = [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
            { vendorId: { $regex: search, $options: 'i' } }
        ];
        const phoneNumber = parseInt(search, 10);
        if (!isNaN(phoneNumber)) {
            orConditions.push({ phone: phoneNumber });
        }
       
        orConditions.push({
            $expr: {
                $regexMatch: {
                    input: { $toString: "$phone" },
                    regex: search,
                    options: "i"
                }
            }
        });
       
        query.$or = orConditions;
    }
   
    const vendors = await VendorModel.find(query)
        .select('-password');
   
    return vendors;
}
    async findVendorsForCarousal(): Promise<VendorEntity[] | []> {
        return await VendorModel.find({ status: 'active', vendorStatus: 'approved' }).select('name profileImage idProof')
    }
    async findTotalVendor(): Promise<number> {
        return VendorModel.countDocuments({ vendorStatus: 'approved' })
    }
}   