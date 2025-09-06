import { VendorProfileEntityInClient } from "../../../entities/vendor/VendorProfileEntityInClient";
import { WorkSamplesEntity } from "../../../entities/workSample/WorkSampleEntity";

export interface IworkSampleRepository {
    createWorkSamples(workSample: WorkSamplesEntity): Promise<WorkSamplesEntity>
    findWorkSample(vendorId: string, pageNo: number): Promise<{ workSamples: WorkSamplesEntity[] | [], totalPages: number }>
    vendorProfileWithWorkSample(vendorId: string): Promise<VendorProfileEntityInClient | null>
}     