import { Types } from "mongoose";
import { VendorProfileEntityInClient } from "../../../domain/entities/vendor/VendorProfileEntityInClient";
import { WorkSamplesEntity } from "../../../domain/entities/workSample/WorkSampleEntity";
import { IworkSampleRepository } from "../../../domain/interfaces/repositoryInterfaces/workSamples/workSampleRepositoryInterface";
import { workSampleModel } from "../../../framework/database/models/workSampleModel";

export class WorkSampleRepository implements IworkSampleRepository {
    async createWorkSamples(workSample: WorkSamplesEntity): Promise<WorkSamplesEntity> {
        return await workSampleModel.create(workSample)
    }
    async findWorkSample(vendorId: string, pageNo: number): Promise<{ workSamples: WorkSamplesEntity[] | [], totalPages: number }> {
        const page = Math.max(pageNo, 1)
        const limit = 3
        const skip = (page - 1) * limit
        const workSamples = await workSampleModel.find({ vendorId }).skip(skip).limit(limit).sort({ createdAt: -1 })
        const totalPages = Math.ceil(await workSampleModel.countDocuments({ vendorId: new Types.ObjectId(vendorId) }) / limit) || 1
        return { workSamples, totalPages }
    }
    async vendorProfileWithWorkSample(vendorId: string): Promise<VendorProfileEntityInClient | null> {
        return await workSampleModel.find({ vendorId }).populate('vendorId', '_id name profileImage').lean<VendorProfileEntityInClient>()
    }
}