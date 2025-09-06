import { WorkSamplesEntity } from "../../../../entities/workSample/WorkSampleEntity"

export interface IfindWorkSamplesOfAVendorUseCase {
    findWorkSamples(vendorId: string,pageNo:number): Promise<{ workSamples: WorkSamplesEntity[] | [], totalPages: number }>
}